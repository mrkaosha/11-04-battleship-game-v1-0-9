namespace SpriteKind {
    export const Cursor = SpriteKind.create()
    export const Boat0 = SpriteKind.create()
    export const Boat1 = SpriteKind.create()
    export const Boat2 = SpriteKind.create()
    export const cpuHit = SpriteKind.create()
}
/**
 * TODO:
 * 
 * 1. CPU functions: CPU can attack intelligently when there are 2 hits in a row and take account of whether the last hit destroyed a boat or not
 * 
 * 2. Boat placement bugs: one way around it is to allow movement to overlap boats but avoid A button presses when boats are overlapping
 * 
 * 3. Animations and messages throughout
 */
// moveBoat needs changes to take in the boatRotateArrayP1 or boatRotateArrayP2
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    rotateFlag = "nothing"
    grid.move(cursor, 0, -1)
    grid.place(shadowCursor, tiles.getTileLocation(grid.spriteCol(cursor), grid.spriteRow(cursor) + 1))
})
function updatePX (whichPlayer: string) {
    if (whichPlayer == "Player1") {
        moveBoat(boatSpriteArrayP1[currentBoat], boatRotateArrayP1)
        if (isOverlapping(boatSpriteArrayP1)) {
            if (rotateFlag != "nothing") {
                boatRotateArrayP1[currentBoat] = rotateFlag
            } else {
                grid.place(cursor, grid.getLocation(shadowCursor))
            }
        }
    } else {
        moveBoat(boatSpriteArrayP2[currentBoat], boatRotateArrayP2)
        if (isOverlapping(boatSpriteArrayP2)) {
            if (rotateFlag != "nothing") {
                boatRotateArrayP2[currentBoat] = rotateFlag
            } else {
                grid.place(cursor, grid.getLocation(shadowCursor))
            }
        }
    }
}
function placeAllCPUBoats () {
    cpuLastHitRow = -1
    cpuLastHitCol = -1
    cpuPlaceBoat0()
    cpuPlaceBoat1()
    cpuPlaceBoat2()
    currentBoat = 1
    while (isOverlapping(boatSpriteArrayP2)) {
        cpuPlaceBoat1()
    }
    currentBoat = 2
    while (isOverlapping(boatSpriteArrayP2)) {
        cpuPlaceBoat2()
    }
    moveBoatFlag += 1
    currentBoat = 0
}
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (currentPlayer == "Player1") {
        rotateFlag = boatRotateArrayP1[currentBoat]
        turnBoat(currentBoat, boatRotateArrayP1)
    }
    if (currentPlayer == "Player2") {
        rotateFlag = boatRotateArrayP2[currentBoat]
        turnBoat(currentBoat, boatRotateArrayP2)
    }
})
function makeBoatVisible (boatArray: Sprite[]) {
    for (let currentBoatSprite of boatArray) {
        currentBoatSprite.setFlag(SpriteFlag.Invisible, false)
    }
}
function cpuMove () {
    game.splash("CPU Move")
    if (cpuHitOrMiss() && searchNSEW()) {
        game.splash("CPU looking for your boat")
        isHitOrMiss(boatSpriteArrayP1, hitOrMissP2)
        switchPlayer()
    } else {
        grid.place(cursor, tiles.getTileLocation(randint(0, 9), randint(0, 6)))
        while (isAttackingTwice(hitOrMissP2)) {
            grid.place(cursor, tiles.getTileLocation(randint(0, 9), randint(0, 6)))
        }
        isHitOrMiss(boatSpriteArrayP1, hitOrMissP2)
        switchPlayer()
    }
}
function isPlayerXWinner (enemyBoats: Sprite[][], hitOrMissPX: Sprite[]) {
    killCount = 0
    for (let index = 0; index <= 2; index++) {
        currentBoatBoomCounter = 0
        for (let currentBoatSprite of enemyBoats[index]) {
            for (let currentBoomSprite of hitOrMissPX) {
                if (grid.spriteRow(currentBoomSprite) == grid.spriteRow(currentBoatSprite) && grid.spriteCol(currentBoomSprite) == grid.spriteCol(currentBoatSprite)) {
                    currentBoatBoomCounter += 1
                    break;
                }
            }
        }
        if (currentBoatBoomCounter == enemyBoats[index].length) {
            killCount += 1
        }
    }
    if (killCount == 3) {
        game.splash(currentPlayer, " WINS!!")
        game.over(true, effects.melt)
    }
    return killCount
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (moveBoatFlag == 3) {
        if (currentPlayer == "Player1") {
            if (isAttackingTwice(hitOrMissP1)) {
                game.splash("That's the WRONG SQUARE!")
            } else {
                isHitOrMiss(boatSpriteArrayP2, hitOrMissP1)
                switchPlayer()
            }
        } else {
            if (isAttackingTwice(hitOrMissP2)) {
                game.splash("That's the WRONG SQUARE!")
            } else {
                isHitOrMiss(boatSpriteArrayP1, hitOrMissP2)
                switchPlayer()
            }
        }
    } else {
        currentBoat += 1
        grid.place(cursor, tiles.getTileLocation(0, 0))
        if (currentBoat == 3) {
            currentBoat = 0
            switchPlayer()
            moveBoatFlag += 1
            if (singlePlayerFlag == 1) {
                switchPlayer()
            }
        }
    }
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    rotateFlag = "nothing"
    grid.move(cursor, -1, 0)
    grid.place(shadowCursor, tiles.getTileLocation(grid.spriteCol(cursor) + 1, grid.spriteRow(cursor)))
})
function switchPlayer () {
    if (moveBoatFlag == 2) {
        cursor.setFlag(SpriteFlag.Invisible, false)
    }
    if (currentPlayer == "Player1") {
        currentPlayer = "Player2"
        for (let boatIterator of boatSpriteArrayP1) {
            makeBoatInvisible(boatIterator)
        }
        makeBoatInvisible(hitOrMissP1)
        makeBoatVisible(hitOrMissP2)
        if (singlePlayerFlag == 1 && moveBoatFlag == 3) {
            cpuMove()
        }
    } else {
        currentPlayer = "Player1"
        for (let boatIterator of boatSpriteArrayP2) {
            makeBoatInvisible(boatIterator)
        }
        makeBoatInvisible(hitOrMissP2)
        makeBoatVisible(hitOrMissP1)
    }
}
function cpuPlaceBoat0 () {
    if (randint(0, 1) == 0) {
        grid.place(cursor, tiles.getTileLocation(randint(0, 8), randint(0, 6)))
        grid.place(boatSpriteArrayP2[0][0], grid.add(grid.getLocation(cursor), 0, 0))
        grid.place(boatSpriteArrayP2[0][1], grid.add(grid.getLocation(cursor), 1, 0))
    } else {
        grid.place(cursor, tiles.getTileLocation(randint(0, 9), randint(0, 5)))
        grid.place(boatSpriteArrayP2[0][0], grid.add(grid.getLocation(cursor), 0, 0))
        grid.place(boatSpriteArrayP2[0][1], grid.add(grid.getLocation(cursor), 0, 1))
    }
}
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    rotateFlag = "nothing"
    grid.move(cursor, 1, 0)
    grid.place(shadowCursor, tiles.getTileLocation(grid.spriteCol(cursor) + -1, grid.spriteRow(cursor)))
})
function moveBoat (boatArray: any[], boatRotateArray: string[]) {
    makeBoatVisible(boatArray)
    if (grid.spriteRow(cursor) >= 8 - boatArray.length && boatRotateArray[currentBoat] == "up") {
        if (rotateFlag != "nothing") {
            boatRotateArray[currentBoat] = rotateFlag
        } else {
            grid.move(cursor, 0, -1)
        }
    }
    if (grid.spriteCol(cursor) >= 11 - boatArray.length && boatRotateArray[currentBoat] == "sideways") {
        if (rotateFlag != "nothing") {
            boatRotateArray[currentBoat] = rotateFlag
        } else {
            grid.move(cursor, -1, 0)
        }
    }
    cursor.setFlag(SpriteFlag.Invisible, true)
    iterator = 0
    for (let currentBoatSprite of boatArray) {
        if (boatRotateArray[currentBoat] == "up") {
            grid.place(currentBoatSprite, tiles.getTileLocation(grid.spriteCol(cursor), grid.spriteRow(cursor) + iterator))
        } else {
            grid.place(currentBoatSprite, tiles.getTileLocation(grid.spriteCol(cursor) + iterator, grid.spriteRow(cursor)))
        }
        iterator += 1
    }
}
function isHitOrMiss (enemyBoats: Sprite[][], hitOrMissPX: Sprite[]) {
    if (currentPlayer == "Player1") {
        hitOrMissPlayer = "Player 1"
    } else if (currentPlayer == "Player2" && singlePlayerFlag == 1) {
        hitOrMissPlayer = "CPU"
    } else {
        hitOrMissPlayer = "Player 2"
    }
    for (let index = 0; index <= 2; index++) {
        for (let currentBoatSprite of enemyBoats[index]) {
            if (grid.spriteCol(currentBoatSprite) == grid.spriteCol(cursor) && grid.spriteRow(currentBoatSprite) == grid.spriteRow(cursor)) {
                if (singlePlayerFlag == 1 && currentPlayer == "Player2") {
                    boomSprite = sprites.create(img`
                        . . . . 2 2 2 2 2 2 2 2 . . . . 
                        . . . 2 4 4 4 5 5 4 4 4 2 2 2 . 
                        . 2 2 5 5 d 4 5 5 5 4 4 4 4 2 . 
                        . 2 4 5 5 5 5 d 5 5 5 4 5 4 2 2 
                        . 2 4 d d 5 5 5 5 5 5 d 4 4 4 2 
                        2 4 5 5 d 5 5 5 d d d 5 5 5 4 4 
                        2 4 5 5 4 4 4 d 5 5 d 5 5 5 4 4 
                        4 4 4 4 . . 2 4 5 5 . . 4 4 4 4 
                        . . b b b b 2 4 4 2 b b b b . . 
                        . b d d d d 2 4 4 2 d d d d b . 
                        b d d b b b 2 4 4 2 b b b d d b 
                        b d d b b b b b b b b b b d d b 
                        b b d 1 1 3 1 1 d 1 d 1 1 d b b 
                        . . b b d d 1 1 3 d d 1 b b . . 
                        . . 2 2 4 4 4 4 4 4 4 4 2 2 . . 
                        . . . 2 2 4 4 4 4 4 2 2 2 . . . 
                        `, SpriteKind.cpuHit)
                    cpuLastHitRow = grid.spriteRow(cursor)
                    cpuLastHitCol = grid.spriteCol(cursor)
                } else {
                    boomSprite = sprites.create(img`
                        . . . . 2 2 2 2 2 2 2 2 . . . . 
                        . . . 2 4 4 4 5 5 4 4 4 2 2 2 . 
                        . 2 2 5 5 d 4 5 5 5 4 4 4 4 2 . 
                        . 2 4 5 5 5 5 d 5 5 5 4 5 4 2 2 
                        . 2 4 d d 5 5 5 5 5 5 d 4 4 4 2 
                        2 4 5 5 d 5 5 5 d d d 5 5 5 4 4 
                        2 4 5 5 4 4 4 d 5 5 d 5 5 5 4 4 
                        4 4 4 4 . . 2 4 5 5 . . 4 4 4 4 
                        . . b b b b 2 4 4 2 b b b b . . 
                        . b d d d d 2 4 4 2 d d d d b . 
                        b d d b b b 2 4 4 2 b b b d d b 
                        b d d b b b b b b b b b b d d b 
                        b b d 1 1 3 1 1 d 1 d 1 1 d b b 
                        . . b b d d 1 1 3 d d 1 b b . . 
                        . . 2 2 4 4 4 4 4 4 4 4 2 2 . . 
                        . . . 2 2 4 4 4 4 4 2 2 2 . . . 
                        `, SpriteKind.Projectile)
                }
                grid.place(boomSprite, grid.getLocation(cursor))
                hitOrMissPX.push(boomSprite)
                game.splash("" + hitOrMissPlayer + " HIT!! " + convertToText(isPlayerXWinner(enemyBoats, hitOrMissPX)) + " boats destroyed!")
                return 1
            }
        }
    }
    boomSprite = sprites.create(img`
        . . . . . . . . b b . . . . . . 
        . . . . . . . b 9 1 b . . . . . 
        . . b b . . . b 9 9 b . . . . . 
        . b 9 1 b . . b b b . . b b b . 
        . b 3 9 b . b b b b . b 9 9 1 b 
        . b b b b b 9 9 1 1 b b 3 9 9 b 
        . . . . b 9 d 9 1 1 b b b b b . 
        . . . . b 5 3 9 9 9 b . . . . . 
        . . b b b 5 3 3 d 9 b . . . . . 
        . b 5 1 b b 5 5 9 b b b b . . . 
        . b 5 5 b b b b b b 3 9 9 3 . . 
        . b b b b b b b . b 9 1 1 9 b . 
        . . . b 5 5 1 b . b 9 1 1 9 b . 
        . . . b 5 5 5 b . b 3 9 9 3 b . 
        . . . . b b b . . . b b b b . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Projectile)
    grid.place(boomSprite, grid.getLocation(cursor))
    hitOrMissPX.push(boomSprite)
    game.splash("" + hitOrMissPlayer + " MISS!!")
    return 0
}
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    rotateFlag = "nothing"
    grid.move(cursor, 0, 1)
    grid.place(shadowCursor, tiles.getTileLocation(grid.spriteCol(cursor), grid.spriteRow(cursor) + -1))
})
function initP1 () {
    boatRotateArrayP1 = ["up", "up", "up"]
    boatSpriteArrayP1 = [[sprites.create(img`
        . . . . . b b b b b b . . . . . 
        . . . b b 9 9 9 9 9 9 b b . . . 
        . . b b 9 9 9 9 9 9 9 9 b b . . 
        . b b 9 d 9 9 9 9 9 9 9 9 b b . 
        . b 9 d 9 9 9 9 9 1 1 1 9 9 b . 
        b 9 d d 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 d 9 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 3 9 9 9 9 9 9 9 9 9 1 9 9 b 
        b 5 3 d 9 9 9 9 9 9 9 9 9 9 9 b 
        b 5 3 3 9 9 9 9 9 9 9 9 9 d 9 b 
        b 5 d 3 3 9 9 9 9 9 9 9 d d 9 b 
        . b 5 3 3 3 d 9 9 9 9 d d 5 b . 
        . b d 5 3 3 3 3 3 3 3 d 5 b b . 
        . . b d 5 d 3 3 3 3 5 5 b b . . 
        . . . b b 5 5 5 5 5 5 b b . . . 
        . . . . . b b b b b b . . . . . 
        `, SpriteKind.Boat0), sprites.create(img`
        . . . . . b b b b b b . . . . . 
        . . . b b 9 9 9 9 9 9 b b . . . 
        . . b b 9 9 9 9 9 9 9 9 b b . . 
        . b b 9 d 9 9 9 9 9 9 9 9 b b . 
        . b 9 d 9 9 9 9 9 1 1 1 9 9 b . 
        b 9 d d 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 d 9 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 3 9 9 9 9 9 9 9 9 9 1 9 9 b 
        b 5 3 d 9 9 9 9 9 9 9 9 9 9 9 b 
        b 5 3 3 9 9 9 9 9 9 9 9 9 d 9 b 
        b 5 d 3 3 9 9 9 9 9 9 9 d d 9 b 
        . b 5 3 3 3 d 9 9 9 9 d d 5 b . 
        . b d 5 3 3 3 3 3 3 3 d 5 b b . 
        . . b d 5 d 3 3 3 3 5 5 b b . . 
        . . . b b 5 5 5 5 5 5 b b . . . 
        . . . . . b b b b b b . . . . . 
        `, SpriteKind.Boat0)], [sprites.create(img`
        . . . . . b b b b b b . . . . . 
        . . . b b 9 9 9 9 9 9 b b . . . 
        . . b b 9 9 9 9 9 9 9 9 b b . . 
        . b b 9 d 9 9 9 9 9 9 9 9 b b . 
        . b 9 d 9 9 9 9 9 1 1 1 9 9 b . 
        b 9 d d 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 d 9 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 3 9 9 9 9 9 9 9 9 9 1 9 9 b 
        b 5 3 d 9 9 9 9 9 9 9 9 9 9 9 b 
        b 5 3 3 9 9 9 9 9 9 9 9 9 d 9 b 
        b 5 d 3 3 9 9 9 9 9 9 9 d d 9 b 
        . b 5 3 3 3 d 9 9 9 9 d d 5 b . 
        . b d 5 3 3 3 3 3 3 3 d 5 b b . 
        . . b d 5 d 3 3 3 3 5 5 b b . . 
        . . . b b 5 5 5 5 5 5 b b . . . 
        . . . . . b b b b b b . . . . . 
        `, SpriteKind.Boat1), sprites.create(img`
        . . . . . b b b b b b . . . . . 
        . . . b b 9 9 9 9 9 9 b b . . . 
        . . b b 9 9 9 9 9 9 9 9 b b . . 
        . b b 9 d 9 9 9 9 9 9 9 9 b b . 
        . b 9 d 9 9 9 9 9 1 1 1 9 9 b . 
        b 9 d d 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 d 9 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 3 9 9 9 9 9 9 9 9 9 1 9 9 b 
        b 5 3 d 9 9 9 9 9 9 9 9 9 9 9 b 
        b 5 3 3 9 9 9 9 9 9 9 9 9 d 9 b 
        b 5 d 3 3 9 9 9 9 9 9 9 d d 9 b 
        . b 5 3 3 3 d 9 9 9 9 d d 5 b . 
        . b d 5 3 3 3 3 3 3 3 d 5 b b . 
        . . b d 5 d 3 3 3 3 5 5 b b . . 
        . . . b b 5 5 5 5 5 5 b b . . . 
        . . . . . b b b b b b . . . . . 
        `, SpriteKind.Boat1), sprites.create(img`
        . . . . . b b b b b b . . . . . 
        . . . b b 9 9 9 9 9 9 b b . . . 
        . . b b 9 9 9 9 9 9 9 9 b b . . 
        . b b 9 d 9 9 9 9 9 9 9 9 b b . 
        . b 9 d 9 9 9 9 9 1 1 1 9 9 b . 
        b 9 d d 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 d 9 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 3 9 9 9 9 9 9 9 9 9 1 9 9 b 
        b 5 3 d 9 9 9 9 9 9 9 9 9 9 9 b 
        b 5 3 3 9 9 9 9 9 9 9 9 9 d 9 b 
        b 5 d 3 3 9 9 9 9 9 9 9 d d 9 b 
        . b 5 3 3 3 d 9 9 9 9 d d 5 b . 
        . b d 5 3 3 3 3 3 3 3 d 5 b b . 
        . . b d 5 d 3 3 3 3 5 5 b b . . 
        . . . b b 5 5 5 5 5 5 b b . . . 
        . . . . . b b b b b b . . . . . 
        `, SpriteKind.Boat1)], [
    sprites.create(img`
        . . . . . b b b b b b . . . . . 
        . . . b b 9 9 9 9 9 9 b b . . . 
        . . b b 9 9 9 9 9 9 9 9 b b . . 
        . b b 9 d 9 9 9 9 9 9 9 9 b b . 
        . b 9 d 9 9 9 9 9 1 1 1 9 9 b . 
        b 9 d d 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 d 9 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 3 9 9 9 9 9 9 9 9 9 1 9 9 b 
        b 5 3 d 9 9 9 9 9 9 9 9 9 9 9 b 
        b 5 3 3 9 9 9 9 9 9 9 9 9 d 9 b 
        b 5 d 3 3 9 9 9 9 9 9 9 d d 9 b 
        . b 5 3 3 3 d 9 9 9 9 d d 5 b . 
        . b d 5 3 3 3 3 3 3 3 d 5 b b . 
        . . b d 5 d 3 3 3 3 5 5 b b . . 
        . . . b b 5 5 5 5 5 5 b b . . . 
        . . . . . b b b b b b . . . . . 
        `, SpriteKind.Boat2),
    sprites.create(img`
        . . . . . b b b b b b . . . . . 
        . . . b b 9 9 9 9 9 9 b b . . . 
        . . b b 9 9 9 9 9 9 9 9 b b . . 
        . b b 9 d 9 9 9 9 9 9 9 9 b b . 
        . b 9 d 9 9 9 9 9 1 1 1 9 9 b . 
        b 9 d d 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 d 9 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 3 9 9 9 9 9 9 9 9 9 1 9 9 b 
        b 5 3 d 9 9 9 9 9 9 9 9 9 9 9 b 
        b 5 3 3 9 9 9 9 9 9 9 9 9 d 9 b 
        b 5 d 3 3 9 9 9 9 9 9 9 d d 9 b 
        . b 5 3 3 3 d 9 9 9 9 d d 5 b . 
        . b d 5 3 3 3 3 3 3 3 d 5 b b . 
        . . b d 5 d 3 3 3 3 5 5 b b . . 
        . . . b b 5 5 5 5 5 5 b b . . . 
        . . . . . b b b b b b . . . . . 
        `, SpriteKind.Boat2),
    sprites.create(img`
        . . . . . b b b b b b . . . . . 
        . . . b b 9 9 9 9 9 9 b b . . . 
        . . b b 9 9 9 9 9 9 9 9 b b . . 
        . b b 9 d 9 9 9 9 9 9 9 9 b b . 
        . b 9 d 9 9 9 9 9 1 1 1 9 9 b . 
        b 9 d d 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 d 9 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 3 9 9 9 9 9 9 9 9 9 1 9 9 b 
        b 5 3 d 9 9 9 9 9 9 9 9 9 9 9 b 
        b 5 3 3 9 9 9 9 9 9 9 9 9 d 9 b 
        b 5 d 3 3 9 9 9 9 9 9 9 d d 9 b 
        . b 5 3 3 3 d 9 9 9 9 d d 5 b . 
        . b d 5 3 3 3 3 3 3 3 d 5 b b . 
        . . b d 5 d 3 3 3 3 5 5 b b . . 
        . . . b b 5 5 5 5 5 5 b b . . . 
        . . . . . b b b b b b . . . . . 
        `, SpriteKind.Boat2),
    sprites.create(img`
        . . . . . b b b b b b . . . . . 
        . . . b b 9 9 9 9 9 9 b b . . . 
        . . b b 9 9 9 9 9 9 9 9 b b . . 
        . b b 9 d 9 9 9 9 9 9 9 9 b b . 
        . b 9 d 9 9 9 9 9 1 1 1 9 9 b . 
        b 9 d d 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 d 9 9 9 9 9 9 1 1 1 9 9 9 b 
        b 9 3 9 9 9 9 9 9 9 9 9 1 9 9 b 
        b 5 3 d 9 9 9 9 9 9 9 9 9 9 9 b 
        b 5 3 3 9 9 9 9 9 9 9 9 9 d 9 b 
        b 5 d 3 3 9 9 9 9 9 9 9 d d 9 b 
        . b 5 3 3 3 d 9 9 9 9 d d 5 b . 
        . b d 5 3 3 3 3 3 3 3 d 5 b b . 
        . . b d 5 d 3 3 3 3 5 5 b b . . 
        . . . b b 5 5 5 5 5 5 b b . . . 
        . . . . . b b b b b b . . . . . 
        `, SpriteKind.Boat2)
    ]]
    for (let boatIterator of boatSpriteArrayP1) {
        makeBoatInvisible(boatIterator)
    }
    hitOrMissP1 = [sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Projectile)]
}
function cpuPlaceBoat1 () {
    if (randint(0, 1) == 0) {
        grid.place(cursor, tiles.getTileLocation(randint(0, 7), randint(0, 6)))
        grid.place(boatSpriteArrayP2[1][0], grid.add(grid.getLocation(cursor), 0, 0))
        grid.place(boatSpriteArrayP2[1][1], grid.add(grid.getLocation(cursor), 1, 0))
        grid.place(boatSpriteArrayP2[1][2], grid.add(grid.getLocation(cursor), 2, 0))
    } else {
        grid.place(cursor, tiles.getTileLocation(randint(0, 9), randint(0, 4)))
        grid.place(boatSpriteArrayP2[1][0], grid.add(grid.getLocation(cursor), 0, 0))
        grid.place(boatSpriteArrayP2[1][1], grid.add(grid.getLocation(cursor), 0, 1))
        grid.place(boatSpriteArrayP2[1][2], grid.add(grid.getLocation(cursor), 0, 2))
    }
}
function isAttackingTwice (boomSpriteArrayPX: Sprite[]) {
    grid.place(shadowCursor, tiles.getTileLocation(-10, -10))
    boomSpriteArrayPX[0] = shadowCursor
    for (let currentBoomSprite of boomSpriteArrayPX) {
        if (grid.spriteCol(currentBoomSprite) == grid.spriteCol(cursor) && grid.spriteRow(currentBoomSprite) == grid.spriteRow(cursor)) {
            return 1
        }
    }
    return 0
}
function initP2 () {
    hitOrMissP2 = [sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Projectile)]
    boatSpriteArrayP2 = [[sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . f f f f f f . f f f f f f . 
        . f f 3 3 3 3 f f f 3 3 3 3 f f 
        . f 3 3 3 3 3 3 f 3 3 3 3 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 b b b 1 1 1 3 3 f 
        . f 3 3 3 3 b b b b b 3 3 3 3 f 
        . f f 3 3 b b b b b b b 3 3 f f 
        . . f f 3 b b b b b b b 3 f f . 
        . . . f f b b b b b b b f f . . 
        . . . . f f b b b b b f f . . . 
        . . . . . f f b b b f f . . . . 
        . . . . . . f f b f f . . . . . 
        . . . . . . . f f f . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Boat0), sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . f f f f f f . f f f f f f . 
        . f f 3 3 3 3 f f f 3 3 3 3 f f 
        . f 3 3 3 3 3 3 f 3 3 3 3 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 b b b 1 1 1 3 3 f 
        . f 3 3 3 3 b b b b b 3 3 3 3 f 
        . f f 3 3 b b b b b b b 3 3 f f 
        . . f f 3 b b b b b b b 3 f f . 
        . . . f f b b b b b b b f f . . 
        . . . . f f b b b b b f f . . . 
        . . . . . f f b b b f f . . . . 
        . . . . . . f f b f f . . . . . 
        . . . . . . . f f f . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Boat0)], [sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . f f f f f f . f f f f f f . 
        . f f 3 3 3 3 f f f 3 3 3 3 f f 
        . f 3 3 3 3 3 3 f 3 3 3 3 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 b b b 1 1 1 3 3 f 
        . f 3 3 3 3 b b b b b 3 3 3 3 f 
        . f f 3 3 b b b b b b b 3 3 f f 
        . . f f 3 b b b b b b b 3 f f . 
        . . . f f b b b b b b b f f . . 
        . . . . f f b b b b b f f . . . 
        . . . . . f f b b b f f . . . . 
        . . . . . . f f b f f . . . . . 
        . . . . . . . f f f . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Boat1), sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . f f f f f f . f f f f f f . 
        . f f 3 3 3 3 f f f 3 3 3 3 f f 
        . f 3 3 3 3 3 3 f 3 3 3 3 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 b b b 1 1 1 3 3 f 
        . f 3 3 3 3 b b b b b 3 3 3 3 f 
        . f f 3 3 b b b b b b b 3 3 f f 
        . . f f 3 b b b b b b b 3 f f . 
        . . . f f b b b b b b b f f . . 
        . . . . f f b b b b b f f . . . 
        . . . . . f f b b b f f . . . . 
        . . . . . . f f b f f . . . . . 
        . . . . . . . f f f . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Boat1), sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . f f f f f f . f f f f f f . 
        . f f 3 3 3 3 f f f 3 3 3 3 f f 
        . f 3 3 3 3 3 3 f 3 3 3 3 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 b b b 1 1 1 3 3 f 
        . f 3 3 3 3 b b b b b 3 3 3 3 f 
        . f f 3 3 b b b b b b b 3 3 f f 
        . . f f 3 b b b b b b b 3 f f . 
        . . . f f b b b b b b b f f . . 
        . . . . f f b b b b b f f . . . 
        . . . . . f f b b b f f . . . . 
        . . . . . . f f b f f . . . . . 
        . . . . . . . f f f . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Boat1)], [
    sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . f f f f f f . f f f f f f . 
        . f f 3 3 3 3 f f f 3 3 3 3 f f 
        . f 3 3 3 3 3 3 f 3 3 3 3 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 b b b 1 1 1 3 3 f 
        . f 3 3 3 3 b b b b b 3 3 3 3 f 
        . f f 3 3 b b b b b b b 3 3 f f 
        . . f f 3 b b b b b b b 3 f f . 
        . . . f f b b b b b b b f f . . 
        . . . . f f b b b b b f f . . . 
        . . . . . f f b b b f f . . . . 
        . . . . . . f f b f f . . . . . 
        . . . . . . . f f f . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Boat2),
    sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . f f f f f f . f f f f f f . 
        . f f 3 3 3 3 f f f 3 3 3 3 f f 
        . f 3 3 3 3 3 3 f 3 3 3 3 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 b b b 1 1 1 3 3 f 
        . f 3 3 3 3 b b b b b 3 3 3 3 f 
        . f f 3 3 b b b b b b b 3 3 f f 
        . . f f 3 b b b b b b b 3 f f . 
        . . . f f b b b b b b b f f . . 
        . . . . f f b b b b b f f . . . 
        . . . . . f f b b b f f . . . . 
        . . . . . . f f b f f . . . . . 
        . . . . . . . f f f . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Boat2),
    sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . f f f f f f . f f f f f f . 
        . f f 3 3 3 3 f f f 3 3 3 3 f f 
        . f 3 3 3 3 3 3 f 3 3 3 3 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 b b b 1 1 1 3 3 f 
        . f 3 3 3 3 b b b b b 3 3 3 3 f 
        . f f 3 3 b b b b b b b 3 3 f f 
        . . f f 3 b b b b b b b 3 f f . 
        . . . f f b b b b b b b f f . . 
        . . . . f f b b b b b f f . . . 
        . . . . . f f b b b f f . . . . 
        . . . . . . f f b f f . . . . . 
        . . . . . . . f f f . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Boat2),
    sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . f f f f f f . f f f f f f . 
        . f f 3 3 3 3 f f f 3 3 3 3 f f 
        . f 3 3 3 3 3 3 f 3 3 3 3 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 3 3 3 1 1 1 3 3 f 
        . f 3 3 3 3 3 b b b 1 1 1 3 3 f 
        . f 3 3 3 3 b b b b b 3 3 3 3 f 
        . f f 3 3 b b b b b b b 3 3 f f 
        . . f f 3 b b b b b b b 3 f f . 
        . . . f f b b b b b b b f f . . 
        . . . . f f b b b b b f f . . . 
        . . . . . f f b b b f f . . . . 
        . . . . . . f f b f f . . . . . 
        . . . . . . . f f f . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Boat2)
    ]]
    boatRotateArrayP2 = ["up", "up", "up"]
    for (let boatIterator of boatSpriteArrayP2) {
        makeBoatInvisible(boatIterator)
    }
}
function makeBoatInvisible (boatArray: Sprite[]) {
    for (let currentBoatSprite of boatArray) {
        currentBoatSprite.setFlag(SpriteFlag.Invisible, true)
    }
}
function cpuPlaceBoat2 () {
    if (randint(0, 1) == 0) {
        grid.place(cursor, tiles.getTileLocation(randint(0, 6), randint(0, 6)))
        grid.place(boatSpriteArrayP2[2][0], grid.add(grid.getLocation(cursor), 0, 0))
        grid.place(boatSpriteArrayP2[2][1], grid.add(grid.getLocation(cursor), 1, 0))
        grid.place(boatSpriteArrayP2[2][2], grid.add(grid.getLocation(cursor), 2, 0))
        grid.place(boatSpriteArrayP2[2][3], grid.add(grid.getLocation(cursor), 3, 0))
    } else {
        grid.place(cursor, tiles.getTileLocation(randint(0, 9), randint(0, 3)))
        grid.place(boatSpriteArrayP2[2][0], grid.add(grid.getLocation(cursor), 0, 0))
        grid.place(boatSpriteArrayP2[2][1], grid.add(grid.getLocation(cursor), 0, 1))
        grid.place(boatSpriteArrayP2[2][2], grid.add(grid.getLocation(cursor), 0, 2))
        grid.place(boatSpriteArrayP2[2][3], grid.add(grid.getLocation(cursor), 0, 3))
    }
}
function searchNSEW () {
    grid.place(cursor, grid.add(tiles.getTileLocation(cpuLastHitCol, cpuLastHitRow), 0, -1))
    if (cpuLastHitRow > 0 && !(isAttackingTwice(hitOrMissP2))) {
        return 1
    }
    grid.place(cursor, grid.add(tiles.getTileLocation(cpuLastHitCol, cpuLastHitRow), 0, 1))
    if (cpuLastHitRow < 6 && !(isAttackingTwice(hitOrMissP2))) {
        return 1
    }
    grid.place(cursor, grid.add(tiles.getTileLocation(cpuLastHitCol, cpuLastHitRow), 1, 0))
    if (cpuLastHitCol < 9 && !(isAttackingTwice(hitOrMissP2))) {
        return 1
    }
    grid.place(cursor, grid.add(tiles.getTileLocation(cpuLastHitCol, cpuLastHitRow), -1, 0))
    if (cpuLastHitCol > 0 && !(isAttackingTwice(hitOrMissP2))) {
        return 1
    }
    return 0
}
function cpuHitOrMiss () {
    mySprite = sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.cpuHit)
    game.splash("Row:" + cpuLastHitRow + "Col:" + cpuLastHitCol)
    if (hitOrMissP2[hitOrMissP2.length - 1].kind() == mySprite.kind()) {
        return 1
    }
    return 0
}
function turnBoat (boatNum: number, boatRotateArray: string[]) {
    if (boatRotateArray[boatNum] == "up") {
        boatRotateArray[boatNum] = "sideways"
    } else {
        boatRotateArray[boatNum] = "up"
    }
}
function isOverlapping (boatSpriteArrayPX: Sprite[][]) {
    for (let index = 0; index <= currentBoat - 1; index++) {
        for (let previousBoatSprite of boatSpriteArrayPX[index]) {
            for (let currentBoatSprite of boatSpriteArrayPX[currentBoat]) {
                if (grid.spriteCol(previousBoatSprite) == grid.spriteCol(currentBoatSprite) && grid.spriteRow(previousBoatSprite) == grid.spriteRow(currentBoatSprite)) {
                    return 1
                }
            }
        }
    }
    return 0
}
let mySprite: Sprite = null
let boomSprite: Sprite = null
let hitOrMissPlayer = ""
let iterator = 0
let hitOrMissP1: Sprite[] = []
let currentBoatBoomCounter = 0
let killCount = 0
let hitOrMissP2: Sprite[] = []
let cpuLastHitCol = 0
let cpuLastHitRow = 0
let boatRotateArrayP2: string[] = []
let boatSpriteArrayP2: Sprite[][] = []
let boatRotateArrayP1: string[] = []
let boatSpriteArrayP1: Sprite[][] = []
let shadowCursor: Sprite = null
let cursor: Sprite = null
let moveBoatFlag = 0
let currentBoat = 0
let rotateFlag = ""
let currentPlayer = ""
let singlePlayerFlag = 0
tiles.setCurrentTilemap(tilemap`level1`)
if (game.ask("Single Player?", "Multiplayer?")) {
    singlePlayerFlag = 1
} else {
    singlePlayerFlag = 0
}
currentPlayer = "Player1"
initP1()
initP2()
rotateFlag = "nothing"
currentBoat = 0
moveBoatFlag = 1
cursor = sprites.create(img`
    3 3 3 3 3 . . . . . . 3 3 3 3 3 
    3 . . . . . . . . . . . . . . 3 
    3 . . . . . . . . . . . . . . 3 
    3 . . . . . . . . . . . . . . 3 
    3 . . . . . . . . . . . . . . 3 
    3 . . . . . . . . . . . . . . 3 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    3 . . . . . . . . . . . . . . 3 
    3 . . . . . . . . . . . . . . 3 
    3 . . . . . . . . . . . . . . 3 
    3 . . . . . . . . . . . . . . 3 
    3 . . . . . . . . . . . . . . 3 
    3 3 3 3 3 . . . . . . 3 3 3 3 3 
    `, SpriteKind.Cursor)
shadowCursor = sprites.create(img`
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
    `, SpriteKind.Cursor)
grid.snap(cursor)
grid.snap(shadowCursor)
if (singlePlayerFlag == 1) {
    placeAllCPUBoats()
}
game.onUpdate(function () {
    if (moveBoatFlag < 3) {
        updatePX(currentPlayer)
    }
})
