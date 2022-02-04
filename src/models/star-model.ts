import {Column, CreateDateColumn, Entity, Index, ObjectID, ObjectIdColumn} from 'typeorm'

@Entity(StarModel.COLLECTION_NAME)
export class StarModel {
    static COLLECTION_NAME = 'stars'

    @ObjectIdColumn()
    id!: ObjectID

    @Column()
    @Index()
    messageId!: string

    @Column()
    @Index()
    userId!: string

    @CreateDateColumn()
    @Index()
    insertTimestamp!: Date

    constructor(params?: {messageId: string; userId: string}) {
        if (params) {
            this.messageId = params.messageId
            this.userId = params.userId
        }
    }
}
