import {mat4} from "gl-matrix";
import { createMat4, createVec2 } from "pure3d";


export const loadOpenCv = (stream:MediaStream) => {
    const {cv} = window as any;
    const canvas = document.createElement("canvas");
    const video:HTMLVideoElement = document.getElementById("video") as HTMLVideoElement;
    const width = video.videoWidth;
    const height = video.videoHeight;
    const imageCapture = new ImageCapture(stream.getVideoTracks()[0]);

    //console.log(cv.estimatePoseSingleMarkers);
    //console.log(cv.Rodrigues);
    //console.log(cv.Dictionary);

    canvas.width = width;
    canvas.height = height;
    canvas.setAttribute("width", `${width}`);
    canvas.setAttribute("height", `${height}`);
    canvas.style.width = `${width}px`; 
    canvas.style.height = `${height}px`; 

    const ctx = canvas.getContext("2d");
   

    const inputImage = new cv.Mat(height, width, cv.CV_8UC4);
    const markerImage = new cv.Mat();
    const RgbImage = new cv.Mat();
    const markerIds = new cv.Mat();
    const markerCorners  = new cv.MatVector();
    const rvecs = cv.Mat.zeros(1,3, cv.CV_64F);
    const rout = cv.Mat.zeros(3,3, cv.CV_64F);
    const tvecs = new cv.Mat();
    const dictionary = new cv.Dictionary(cv.DICT_6X6_250);
    const parameters = getCvParameters(cv);
    const {cameraMatrix, distCoeffs} = getCvSettings(cv);

    const inverse = cv.matFromArray(4,4, cv.CV_64F, [ 1.0, 1.0, 1.0, 1.0,
                               -1.0,-1.0,-1.0,-1.0,
                               -1.0,-1.0,-1.0,-1.0,
                                1.0, 1.0, 1.0, 1.0]);

    console.log(inverse.data64F);
    // TBC: https://github.com/avmeer/ComputerVisionAugmentedReality/blob/master/TestVision/main.cpp#L857
    // https://stackoverflow.com/a/46536427/784519
    // https://github.com/ajaymin28/Aruco_python/blob/master/main.py
    return () => {
        return new Promise(resolve => { 
            ctx.drawImage(video, 0, 0);
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            inputImage.data.set(data);
            cv.cvtColor(inputImage, RgbImage, cv.COLOR_RGBA2RGB, 0);
            cv.detectMarkers(RgbImage, dictionary, markerCorners, markerIds, parameters);

            if (markerIds.rows > 0) {
                cv.estimatePoseSingleMarkers(markerCorners, 0.1, cameraMatrix, distCoeffs, rvecs, tvecs);
                cv.Rodrigues(rvecs, rout);

                const tmat = tvecs.data64F;
                const rmat = rout.data64F;

                const viewMatrix = cv.matFromArray(4,4,cv.CV_64F, [
                                    rmat[0],rmat[1],rmat[2],tmat[0],
                                    rmat[3],rmat[4],rmat[5],tmat[1],
                                    rmat[6],rmat[7],rmat[8],tmat[2],
                                    0.0       ,0.0       ,0.0       ,1.0    
                                    ]);

                const output = cv.Mat.zeros(4,4, cv.CV_64F);
                cv.multiply(inverse, viewMatrix, output);

                cv.transpose(output, output);
                const final = output.data64F;

                resolve(final);
            } else {
                resolve(false);
                //console.log("NADDA");
            }
        }) 
    }

}

// all below values taken from https://github.com/ganwenyao/opencv_js

const getCvSettings = (cv) => {
    const cameraMatrix = cv.matFromArray(3, 3, cv.CV_64F, [9.6635571716090658e+02, 0., 2.0679307818305685e+02, 0.,
                               9.6635571716090658e+02, 2.9370020600555273e+02, 0., 0., 1.]);
    const distCoeffs = cv.matFromArray(5, 1, cv.CV_64F, [-1.5007354215536557e-03, 9.8722389825801837e-01,
                                 1.7188452542408809e-02, -2.6805958820424611e-02,-2.3313928379240205e+00]);

    return {cameraMatrix, distCoeffs}
}
// no idea what these mean...
const getCvParameters = (cv) => {
    const parameter = new cv.DetectorParameters();

    // parameter.adaptiveThreshWinSizeMin = 3,
    parameter.adaptiveThreshWinSizeMin = 23;
    // parameter.adaptiveThreshWinSizeMax = 23,
    parameter.adaptiveThreshWinSizeMax = 23;
    parameter.adaptiveThreshWinSizeStep = 10,
    parameter.adaptiveThreshConstant = 7;
    // parameter.minMarkerPerimeterRate = 0.03;
    parameter.minMarkerPerimeterRate = 0.1;
    parameter.maxMarkerPerimeterRate = 4;
    parameter.polygonalApproxAccuracyRate = 0.03;
    parameter.minCornerDistanceRate = 0.05;
    parameter.minDistanceToBorder = 3;
    parameter.minMarkerDistanceRate = 0.05;
    parameter.cornerRefinementMethod = cv.CORNER_REFINE_NONE;
    parameter.cornerRefinementWinSize = 5;
    parameter.cornerRefinementMaxIterations = 30;
    parameter.cornerRefinementMinAccuracy = 0.1;
    parameter.markerBorderBits = 1;
    // parameter.perspectiveRemovePixelPerCell = 4;
    parameter.perspectiveRemovePixelPerCell = 2;
    parameter.perspectiveRemoveIgnoredMarginPerCell = 0.13;
    parameter.maxErroneousBitsInBorderRate = 0.35;
    parameter.minOtsuStdDev = 5.0;
    parameter.errorCorrectionRate = 0.6;

    return parameter;
}