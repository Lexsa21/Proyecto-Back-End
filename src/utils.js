import {dirname} from "path"
import { fileURLToPath } from "url"
import bcrypt from 'bcrypt';


export  const __dirname=dirname(fileURLToPath(import.meta.url))
export const SECRET = 'coder__53160_secret'

//Clase 20
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

//export const isValidPassword = (passwordToVerify, storedHash) => bcrypt.compareSync(passwordToVerify, storedHash);

export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);