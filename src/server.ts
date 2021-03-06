
import express = require('express')
import bodyparser = require('body-parser')
import { MetricsHandler } from './metrics'
import session = require('express-session')
import levelSession = require('level-session-store')
import { UserHandler, User } from './user'


import path = require('path');
let ejs = require('ejs');

const app = express()
const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')


app.use(express.static(path.join(__dirname, '/../public')))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded())

app.set('views', __dirname + "/../views")
app.set('view engine', 'ejs');


const port: string = process.env.PORT || '8080'



app.listen(port, (err: Error) => {
  if (err) {
    throw err
  }
  console.log(`server is listening on port ${port}`)
})


const LevelStore = levelSession(session)

app.use(session({
  secret: 'my very secret phrase',
  store: new LevelStore('./db/sessions'),
  resave: true,
  saveUninitialized: true
}))


const dbUser: UserHandler = new UserHandler('./db/users')
const authRouter = express.Router()

authRouter.get('/login', (req: any, res: any) => {
  res.render('login')
})

authRouter.get('/signup', (req: any, res: any) => {
  res.render('signup')
})

authRouter.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect('/login')
})

app.post('/login', (req: any, res: any, next: any) => {
 
    dbUser.getAll((err: Error | null, result?: User)=>{
    console.log(result);
    return res.status(200).send(result);
  })
  /*
  dbUser.get(req.body.username, (err: Error | null, result?: User) => {
    if (err) next(err)
    if (result === undefined || !result.validatePassword(req.body.password)) {
      res.redirect('/login')
    } else {
      req.session.loggedIn = true
      req.session.user = result
      res.redirect('/')
    }
  })
  */
})

app.post('/signup', (req: any, res: any, next: any) => {
  console.log(req.body.username);
  dbUser.get(req.body.username, function (err: Error | null, result?: User) {
    if (!err || result !== undefined) {
    res.status(409).send("user already exists")
    } else {
      let user = new User(req.body.username,req.body.email,req.body.password,false);
      dbUser.save(user, function (err: Error | null) {

  if (err) next(err)

  else res.status(201).send("user persisted")
        })
      }
    })
})

app.use(authRouter)
const userRouter = express.Router()


    userRouter.post('/', (req: any, res: any, next: any) => {
      console.log(req.body.username);
      dbUser.get(req.body.username, function (err: Error | null, result?: User) {
        if (!err || result !== undefined) {
        res.status(409).send("user already exists")
        } else {
          dbUser.save(req.body, function (err: Error | null) {

  if (err) next(err)

  else res.status(201).send("user persisted")
          })
        }
      })
    })

    userRouter.get('/:username', (req: any, res: any, next: any) => {
      dbUser.get(req.params.username, function (err: Error | null, result?: User) {
        if (err || result === undefined) {
          res.status(404).send("user not found")
        } else res.status(200).json(result)
      })
    })

    app.use('/user', userRouter)

const authCheck = function (req: any, res: any, next: any) {
    if (req.session.loggedIn) {
      next()
    } else res.redirect('/login')
}
  
app.get('/', authCheck, (req: any, res: any) => {
    res.render('index', { name: req.session.username })
})