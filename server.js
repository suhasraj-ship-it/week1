const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const User = require('/user');
const cors =require('cors')
const app=express();
const PORT = 7000;
app.use(cors());
app.use(bodyParser.json());
const mongo_db='mongodb://localhost:27017/raks';
mongoose.connect(mongo_db, { useNewUrlParser: true, useUnifiedTopology: true })
         .then(()=>console.log('connected to mongodb'))
         .catch(err=>console.log(err));


app.post('/signup',async(req,res)=>{
    const {username,email,password , confirmPassword}=req.body;

    if(!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }
    try{
        const userExist = await User.findOne({email});
        if (userExist) {
            return res.status(400).json({message:'User alraedy exist'})
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Signup successful!' });
} catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error.' });
}
});
app.post('/signin',async(req , res)=>{
    const {email,password}=req.body;

    if(!email || !password) {
        return res.status(400).json({message:'Email and password fields are required'})
    }
    try{
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message:'Invalid email or password'})
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if(!isValidPassword){
        return res.status(400).json({message:'Invalid email or password'})
    }
    res.status(200).json({message:'signed in successfully'})
}catch(error){
   console.log('Error occured during signin:',error);
   res.status(500).json({message:'Internal server error'})
}

});
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})