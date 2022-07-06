// TODO: Might not need this...not currently using
export type Hitable = {
    hit: () => void
}

type HitableGameObject = {
    gameObject: Phaser.GameObjects.GameObject & Hitable
}

type HitableBodyType = {
    gameObject: HitableGameObject
}

export type CollisionHitable = Phaser.Types.Physics.Matter.MatterCollisionData & {
    bodyA: MatterJS.BodyType & HitableBodyType
    bodyB: MatterJS.BodyType & HitableBodyType
}