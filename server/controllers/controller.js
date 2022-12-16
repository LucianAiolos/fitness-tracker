const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const { MongoMissingCredentialsError } = require('mongodb')

const createUser = async (req,res) => {
  const {user_name, email, password, exercises } = req.body

  const isNewUser = await User.isEmailInUse(email)
  if(!isNewUser)
  return res.json({
    success: false,
    message: 'Email already in use',
  })
  // use Schema Pre  to hash passwords
  const user = await User({
    user_name,
    email,
    password,
    exercises,
  })
  await user.save()
  res.json({ success: true, user })
}

const signIn = async (req, res) => {
  const {email, password} = req.body
  User.findOne({email: email}, function(err, user) {
    if(err)throw err
    //we pass the user in the call back function to the comparepw method
    user.comparePassword(password, function(err, isMatch) {
      if(err) throw errconsole.log(isMatch)
      return console.log(isMatch, 'is match')
    })
    return res.status(200).json({message: "success", data: {id: user.id} })
  })  
}

const home = async (req, res) => {
  const {id} = req.params

  User.findById(id, (err, data) => {
    if(err) {
      res.send(err)
    } else {
      res.status(200).json({
        message: "Found user",
        data: data,
      })
    }
  }) 
}

const updateExercise = async (req, res) => {
  console.log('fetching update exercise')
  const { id } = req.params

  User.findByIdAndUpdate(id,
      {$set: {
        user_name: req.body.user_name,
        exercises: req.body.exercises,
      }},
      {new: true},
      (err, user) => {
        if(err){
          res.status(400).json({error: err})
        } else {
          res.status(200).json({
            message: "Update call success",
            data: user,
          })
        }
      }
    )
}

const addExercise = async (req, res) => {
  const {id} = req.body
  User.findByIdAndUpdate(id,
    { $push: {"exercises": {
      x_name: req.body.exercise,
      duration: req.body.duration
    }} },
    {new: true},
    (err, user) => {
      if(err) {
        res.send(err, 'Problem adding exercise')
      } else {
        res.status(200).json({message: "success", data: user})
      }
    }
  )
}

const deleteExercise = async (req, res) => {
  const {id} = req.body
  const userId = req.params

  console.log(id, userId)

  // User.findById( userId.id, (err, user) =>{
  //   if(err) { console.log(err)}
  //   else {console.log(user)}
  // })


  User.findByIdAndUpdate( userId.id ,
    { $pull: { exercises: { _id: id }}},
    { new: true, lean: true }, function (err, user) {
      if(err) {
        res.status(400).json({ message: "error deleting" })
      } else {
        res.status(200).json({ message: 'success deleting', data: user, })
      }
    }
  )
}

module.exports = {signIn, home, updateExercise, createUser, addExercise, deleteExercise}