import {Column, CreateDateColumn, Entity, Index, ObjectID, ObjectIdColumn} from 'typeorm'

@Entity(StarboardMessageModel.COLLECTION_NAME)
export class StarboardMessageModel {
    static COLLECTION_NAME = 'starboard_messages'

    @ObjectIdColumn()
    id!: ObjectID

    @Column()
    @Index()
    starredMessageId!: string

    @Column()
    @Index()
    starboardMessageId!: string

    @CreateDateColumn()
    @Index()
    insertTimestamp!: Date

    constructor(params?: {starredMessageId: string; starboardMessageId: string}) {
        if (params) {
            this.starredMessageId = params.starredMessageId
            this.starboardMessageId = params.starboardMessageId
        }
    }
}
