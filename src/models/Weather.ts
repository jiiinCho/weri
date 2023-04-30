import { createRealmContext } from "@realm/react";
import Realm from "realm";

export class Weather extends Realm.Object<Weather> {
  _id: Realm.BSON.ObjectId = new Realm.BSON.ObjectId();
  name!: string;
  temperature!: Realm.List<number>;
  temperatureUnit!: string;
  time!: Realm.List<string>;
  timeUnit!: string;

  static primaryKey = "_id";

  constructor(
    realm: Realm,
    name: string,
    temperature: number[],
    temperatureUnit: string,
    time: string[],
    timeUnit: string
  ) {
    super(realm, { name, temperature, temperatureUnit, time, timeUnit });
  }
}

export const weatherContext = createRealmContext({
  schema: [Weather],
});
