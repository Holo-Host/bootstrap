import { MessagePackData, encode, messagePackDecoder } from '../msgpack/msgpack'
import { key, Key, agentKey } from './kv'
import { spaceLength } from '../kitsune/kitsune'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { Uint8ArrayDecoder } from '../io/io'

export async function _get(key:Key):MessagePackData|Error {
 let space = key.slice(0,spaceLength)
 let agent = key.slice(spaceLength)
 let value = await BOOTSTRAP.get(agentKey(space, agent), 'arrayBuffer')
 // Found values are already messagepack encoded but null won't be so we have to
 // manually encode it here.
 return ( value === null ) ? encode(null) : new Uint8Array(value)
}

export async function get(input:MessagePackData):MessagePackData|Error {
 // Values are already messagepack data so return as is.
 // @todo is this the right thing to do?
 return pipe(
  Uint8ArrayDecoder.decode(input),
  E.chain(value => messagePackDecoder.decode(value)),
  E.chain(value => key.decode(value)),
  E.chain(async keyValue => await _get(keyValue))
 )
}
