'use strict';
export default class ResponseHelper {
    returnSuccess = (res, data) => {
        return res.status(200).json({
            success: true,
            data: data
        })
    };

    returnError = (res, data) => {
        console.log(data);
        return res.status(400).json({
            success: false,
            error: data.message
        })
    }
}