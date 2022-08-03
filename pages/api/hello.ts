import { IncomingForm } from 'formidable';
import type { NextApiRequest, NextApiResponse } from 'next'
import ffmpeg from 'fluent-ffmpeg'


export const config = {
  api: {
    bodyParser: false,
  },
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {


  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  }) as any;


  const file = data?.files?.inputFile.filepath;


  try {
    const x = ffmpeg({ source: file })
      .on('error', (err) => {
        console.log(err);
      })
      .on('end', (err) => {
        console.log('kaajja');
        console.log(err);
      })
      .setStartTime('00:00:00')
      .setDuration('12')
      .size("500x830")
      .fps(30)
      .saveToFile("public/vertical.gif")

    // const { secure_url: secureURL } = await cloudinary.uploader.upload(
    //   result.files.image.filepath,
    // );

    // paths = secureURL;

    // console.log(x);

    return res.json({ newPath: 'public/vertical.gif' })
  } catch (error: any) {
    console.log("Error", error);
    return res.json(error.message);
  }





}
