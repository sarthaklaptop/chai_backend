// we will use asyncHandler

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler ( async (req, res) => {
    // get user details form frontend
    // validation for all the details user entered - not empty
    // check if user already exists - using username and email
    // check for images
    // check for avatar
    // upload them to cloudinary, check avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response

    // data
    const {username, email, fullName, password}= req.body
    // console.log("email:- ", email)

    // validation
    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError (400, "All fields are required")
    }

    // userr already exists?
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username Already Exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if( req.files && Array.isArray(req.files?.coverImage) && req.files?.coverImage.length > 0){

        coverImageLocalPath = req.files?.coverImage[0]?.path

    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadonCloudinary(avatarLocalPath);

    const coverImage = await uploadonCloudinary(coverImageLocalPath)


    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    // db entry
    const user = await User.create({
        fullName, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select( 
        "-password -refreshToken"
     )

    if (!createdUser){
        throw new ApiError(500, "Server || Something went wrong while registering a user    ")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Created Successfully")
    )
} )


export {
    registerUser,
}