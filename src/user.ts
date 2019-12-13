import { LevelDB } from "./leveldb"
import WriteStream from 'level-ws'

const crypto = require('crypto');

export class User {
    public username: string
    public email: string
    private password: string = ""
  
    constructor(username: string, email: string, password: string, passwordHashed: boolean = false) {
      this.username = username
      this.email = email
  
      if (!passwordHashed) {
        this.setPassword(password)
      } else this.password = password
    }
    static fromDb(username: string, value: any): User {
        const [password, email] = value.split(":")
        return new User(username, email, password,true);
      }


    
      public setPassword(toSet: string): void {
        const hashedPassword : string = crypto.createHash('md5').update(toSet).digest('hex');
        console.log("Set password executed");
        console.log(toSet);
        console.log(hashedPassword);
        this.password=hashedPassword;
        
        // Hash and set password
      }
    
      public getPassword(): string {
        console.log(this.password);
        return this.password
      }
    
      public validatePassword(toValidate: string): boolean {
        // return comparison with hashed password
        const hashedValidate : string = crypto.createHash('md5').update(toValidate).digest('hex');
        console.log(toValidate);
        console.log(hashedValidate);
        if(this.password!==hashedValidate){
          return false;
        }else{
          return true;
        }

      }
    }



export class UserHandler {
  public db: any

  constructor(path: string) {
    this.db = LevelDB.open(path)
  }

  public getAll(callback: (error: Error | null, result: any | null) => void) {
    let user: User[] = []

    this.db.createReadStream()
      .on('data', function (data) {
        console.log(data);
      })
      .on('error', function (err) {
        callback(err, null);
        console.log('Oh my!', err)
      })
      .on('close', function () {
        console.log('Stream closed')
      })
      .on('end', function () {
        callback(null, user);
        console.log('Stream ended')
      })
  }

  public get(username: string, callback: (err: Error | null, result?: User) => void) {
    this.db.get(`user:${username}`, function (err: Error, data: any) {
      if (err) callback(err)
      else if (data === undefined) callback(null, data)
      else callback(null, User.fromDb(username, data))
    })
  }

  public save(user: User, callback: (err: Error | null) => void) {
    this.db.put(`user:${user.username}`, `${user.getPassword()}:${user.email}`, (err: Error | null) => {
      callback(err)
    })
  }



  public delete(username: string, callback: (err: Error | null) => void) {

    this.db.del(`user:${username}`, (err: Error | null) => {
      callback(err)
    })
  
  }

  
}