import './init'
import {createConnection, getMongoManager} from 'typeorm'
import {StarboardMessageModel} from './models/starboard-message-model'
import {edgedbClient} from './edgedb'
import e from './edgeql-js'

async function run() {
    await createConnection()
    const rows = await getMongoManager().find(StarboardMessageModel)
    await edgedbClient.query(
        `
    with
        raw_data := <json>$data
    for item in json_array_unpack(raw_data) union (
        insert StarboardMessage {
            starredMessageId := <str>item['starredMessageId'],
            starboardMessageId := <str>item['starboardMessageId'],
            insertTimestamp := <datetime>item['insertTimestamp']
        }
    )
    `,
        {
            data: JSON.stringify(rows),
        },
    )
}

run()
    .catch((e) => {
        console.error(e)
    })
    .then(() => process.exit())
