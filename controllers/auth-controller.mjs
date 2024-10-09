import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ResponseModel from "../models/ResponseModel.mjs";
import ErrorResponse from "../models/ErrorResponseModel.mjs";
import { createAccount, verifyEmailService } from "../services/externalApiServices.mjs";
import CookieHandler from "../utilities/CookieHandler.mjs";

/**
 * @desc Register user
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = asyncHandler(async (req, res, next) => {
    try {
        const response = await createAccount(req.body);

        const cookie = new CookieHandler(res);
        const { jwt } = response;
        cookie.setCookie('registration', { jwt });

        res.status(201).json(new ResponseModel(201, 'Account registred', response));
    } catch (error) {
        next(error);
    }
});

/**
 * @desc Email verification
 * @route POST /api/v1/auth/verify-email
 * @access Public
 */
export const verifyEmail = asyncHandler(async (req, res, next) => {
    const { email, code } = req.body;

    let cookie = req.cookies.registration;
    let cookieData;

    if (cookie) {
        try {
            cookieData = JSON.parse(cookie);
        } catch (error) {
            throw new ErrorResponse(401, 'Invalid cookie data', 'internal');
        }
    }

    const [bearer, jwt] = cookieData.jwt.split(' ');

    if (bearer !== 'Bearer' || !jwt) {
        throw new ErrorResponse(401, 'Invalid authorization format', 'internal');
    }

    try {
        const verificationData = await verifyEmailService(email, code, cookieData.jwt);
        cookie = new CookieHandler(res);
        cookie.deleteCookie('registration');
        res.status(200).json(new ResponseModel(200, 'Email verified successfully', verificationData));
    } catch (error) {
        next(error);
    }

});

/**
 * @desc Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'Login Successful'
    });
});