function setHealth(player: PlayerMp, value : number){
    // CALL EVERYTIME ANTICHEAT SETHEALTH IF YOU WANT TO SET HEALTH OF PLAYER
    player.call('Client:Anticheat:SetHealth', value)

    setTimeout(() => player.setHealth(value), 500)
}

function setArmour(player: PlayerMp, value : number){
    // CALL EVERYTIME ANTICHEAT SETARMOUR IF YOU WANT TO SET ARMOUR OF PLAYER
    player.call('Client:Anticheat:SetArmour', value)

    setTimeout(() => player.setArmour(value), 500)
}

function giveWeapon(player: PlayerMp, weaponHash: number, weaponAmmo: number, equipNow: boolean){
    // EVERYTIME CALL FIRST Anticheat GiveWeapon Client before Give on Server
    player.call('Client:Anticheat:GiveWeapon', weaponHash, weaponAmmo)

    setTimeout(() => player.giveWeapon(weaponHash, weaponAmmo, equipNow), 500)
}

function removeWeapon(player: PlayerMp, weaponHash: number){
    // EVERYTIME FIRST REMOVE WEAPON SERVERSIDE BEFORE CLIENT
    player.removeWeapon(weaponHash)

    setTimeout(() => player.call('Client:Anticheat:RemoveWeapon', weaponHash), 500)
}

function clearWeapons(player: PlayerMp){
    player.removeAllWeapons()

    setTimeout(() => player.call('Client:Anticheat:ClearWeapons'), 500)
}

function setPosition(player: PlayerMp, position: Vector3Mp) {
    player.call('Client:Anticheat:Timeout')

    player.position = position
}

mp.events.add('Server:Anticheat:Flag', (player: PlayerMp, flag: string) =>{
    console.log('[Anticheat] Flag ' + flag + ' detected on ' + player.name)

    // DO SOMETHING...
})