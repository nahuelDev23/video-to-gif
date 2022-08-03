import { IncomingForm } from 'formidable';
import type { NextApiRequest, NextApiResponse } from 'next'
import ffmpeg from 'fluent-ffmpeg'
type Data = {
  name: string
}

export const config = {
  api: {
    bodyParser: false,
  },
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {


  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
  console.log(data?.files?.inputFile.filepath);

  const file = data?.files?.inputFile.filepath;


  try {
    ffmpeg({ source: file })
      .on('error', (err) => {
        console.log(err);
      })
      .on('end', (err) => {
        console.log('joder');
      })
      .setStartTime('00:00:00')
      .setDuration('5')
      .size("500x830")
      .fps(60)
      .saveToFile("public/vertical.gif")
    return res.json({ newPath: 'public/vertical.gif' })
  } catch (error) {
    console.log("Error", error);
    return res.json(error.message);
  }





}
