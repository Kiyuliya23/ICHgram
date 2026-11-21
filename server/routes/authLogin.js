import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getDb } from "../.db/config.js";


const router = Router();

router.post("/login", async (req,res)=>{
    try {
        const {login, password} = req.body ?? {};

        if(
            typeof login !== "string" ||
            typeof password !== "string" ||
            !login.trim() ||
            !password
        ){
            return res.status(400).json({
                message: "Login and password are required",  
            });
        }

        const normalizedLogin = login.trim().toLowerCase();

        const db = getDb();
        const user = await db.collection("users").findOne({
            $or: [
                {email: normalizedLogin},
                {username: normalizedLogin },

            ],
        });

        if(!user){
           
            return res.status(401).json({
                 message: "Invalid login or password",
            });
        }
        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash  
        );
        if(!isPasswordValid){
           
            return res.status(401).json({
                 message: "Invalid login or password",
            });
        }
        const token = jwt.sign(
  { id: user._id.toString() },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

return res.status(200).json({
  message: "Login successful",
  token,
  user: {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    bio: user.bio,
    website: user.website,
    avatarUrl: user.avatarUrl,
  },
});

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Login failed",
        });
    
    }

})

export default router;