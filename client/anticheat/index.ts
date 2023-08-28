import { Weapon } from "./models/weapon";

class Anticheat {
    private _health: number = 100
    private _armour: number = 0
    private _timeout: number = Date.now()
    private _currentWeapons: Weapon[] = []
    private _shoots: number = 0
    private _lastPosition: Vector3Mp = mp.players.local.position
    private _camera = mp.cameras.new("gameplay")

    constructor() {
        mp.events.add('Client:Anticheat:GiveWeapon', this.giveWeapon.bind(this))
        mp.events.add('Client:Anticheat:RemoveWeapon', this.removeWeapon.bind(this))
        mp.events.add('Client:Anticheat:ClearWeapons', this.clearWeapons.bind(this))
        mp.events.add('Client:Anticheat:SetHealth',  this.setHealth.bind(this))
        mp.events.add('Client:Anticheat:SetArmour',  this.setArmour.bind(this))
        mp.events.add('Client:Anticheat:Timeout', this.timeoutAnticheat.bind(this))

        mp.events.add('outgoingDamage', this.outgoingDamage.bind(this))
        mp.events.add('incomingDamage', this.incomingDamage.bind(this))

        mp.events.add('playerWeaponShot', this.checkWeaponCheat.bind(this))

        setInterval(() => {
            this._shoots = 0
        }, 1000);

        setInterval(() => {
            this.checkTeleport()
        }, 2000);
    }

    private hasWeapon(weaponHash: number): boolean {
        return this._currentWeapons.some(weapon => weapon.weaponHash === weaponHash);
    }

    removeWeapon(weaponHash: number): void {
        this._currentWeapons = this._currentWeapons.filter(weapon => weapon.weaponHash !== weaponHash);
    }

    giveWeapon(hash: number, ammo: number): void {
        if (!this.hasWeapon(hash)) {
            this._currentWeapons.push(new Weapon(hash, ammo));
        }
    }

    clearWeapons(): void {
        this._currentWeapons = [];
    }

    setHealth(value: number): void {
        this._health = value;
    }

    setArmour(value: number): void {
        this._armour = value;
    }

    getHealth(): number {
        return this._health;
    }

    getArmour(): number {
        return this._armour;
    }

    timeoutAnticheat() : void {
        this._timeout = Date.now();
    }

    warnAnticheat(flag: string): void {
        mp.events.callRemote('Server:Anticheat:Flag', flag);
    }

    outgoingDamage(sourceEntity: PlayerMp, targetEntity: PlayerMp, sourcePlayer: PlayerMp,  weapon: number, boneIndex: number, damage: number){
        if (targetEntity.type === 'player' ) {

            /*  

            If the player isn't facing the target, the bullet won't pass through.      
            A small workaround for magic bullet cheats.     
            For experimental purposes only, and a provisional solution! 
            
            */

            let raycast = this.createRaycast();

            if (raycast == null || raycast.entity !== targetEntity)  {   
                return true
            }
        }
    }

    incomingDamage(sourceEntity: PlayerMp, sourcePlayer: PlayerMp, targetEntity : PlayerMp, weapon: number, boneIndex: number, damage: number) {
        if (targetEntity.type === 'player') {
            
            var completeHealth = this.getHealth() + this.getArmour()
            var weaponDamage = 20

            /* A small workaround against health cheats, not the best approach! */

            if (completeHealth - weaponDamage <= 0 || this.getHealth() - weaponDamage <= 0){
                mp.events.callRemote("Server:DeathEvent", sourcePlayer, weapon);
            }
            else { 
                if (this.getArmour() > 0){          
                    if (this.getArmour() - weaponDamage < 0){              
                        this.setHealth(this.getHealth() + this.getArmour() - weaponDamage)            
                        this.setArmour(0)     
                    }        
                    else {        
                        this.setArmour(this.getArmour() - weaponDamage)        
                    }     
                }     
                else {        
                    this.setHealth(this.getHealth()  - weaponDamage) 
                }
            }
        }
    }

     createRaycast(): any {
        const position = this._camera.getCoord();
        const direction = this._camera.getDirection();
        const farAway = new mp.Vector3(
            direction.x + position.x * 250,
            direction.y + position.y * 250,
            direction.z + position.z * 250
        );

        const hitData = mp.raycasting.testPointToPoint(position, farAway, mp.players.local);

        return hitData && hitData.entity && mp.game.entity.isAnEntity(hitData.entity.handle) ? hitData : null;
    }
    
    
    checkWeaponCheat(targetPosition : Vector3Mp, targetEntity : PlayerMp) {
        if (Date.now() - this._timeout < 1000) {
            return;
        }
    
        const weapon = mp.game.invoke("0x0A6DB4965674D243", mp.players.local.handle)
        const weaponAmmo = mp.game.invoke('0x015A522136D7F951', mp.players.local.handle, weapon >> 0)
    
        if (weapon === -1569615261 /* Unarmed */ )
            return
    
        let currentWeapon = this._currentWeapons.find(x => x.weaponHash === weapon)
    
        if (currentWeapon === null || currentWeapon === undefined) {  
            this.warnAnticheat('Weapon Cheat:  ' + weapon)
            mp.players.local.removeWeapon(weapon);
        }else {
            currentWeapon.weaponAmmo--;

            if (weaponAmmo - 1 > currentWeapon.weaponAmmo) {
                this.warnAnticheat('Weapon Ammo Cheat!')
            }
        }
    
        this._shoots++;
        if (this._shoots > 30){
            this.warnAnticheat('Higher Weapon Fire Rate')
        }
    }

     checkTeleport(){
        var currentPos = mp.players.local.position
    
        const distance = mp.game.gameplay.getDistanceBetweenCoords(
            this._lastPosition.x,
            this._lastPosition.y,
            this._lastPosition.z,
            currentPos.x,
            currentPos.y,
            currentPos.z,
            true
        );
    
        this._lastPosition = mp.players.local.position

        if (Date.now() - this._timeout < 1000) {
            return;
        }
      
        if (mp.players.local.vehicle != null && mp.players.local.isInAnyVehicle(true)  && distance > 500) {
            this.warnAnticheat('Vehicle Noclip')
            
        } else if (distance > 50) {
            this.warnAnticheat('Noclip')      
        }
    }
}

export default Anticheat;
