const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user');
const auth = require('../middleware/auth')
const { welcomeMsg, CancellationMsg} = require('../emails/account')
const router = new express.Router()




// USER ENDPOINT
router.post('/users', async (req, res) => {
    const user = new User(req.body); 

    try {
        await user.save()
        welcomeMsg(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token})
    } catch (e) {
        res.status(400).send(e)
    }

});

router.post('/users/login', async (req, res)=> {

    try {

    const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        
    res.send({user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me',auth, async (req, res) => {
    res.send(req.user)

})

router.patch('/users/me', auth, async(req, res)=> {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'email', 'password']
    const validOperations = updates.every((update) => allowedUpdates.includes(update))
    if (!validOperations) {
        res.status(400).send({error : 'invalid update'})
    }

    try {
        updates.forEach((update)=> req.user[update] = req.body[update] )
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(404).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        CancellationMsg(req.user.name, req.user.email)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize({width : 250, height : 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})


module.exports = router







