import { IncomingForm } from 'formidable';
import type { NextApiRequest, NextApiResponse } from 'next'
import ffmpeg from 'fluent-ffmpeg'
// import mv from 'mv'
import { v2 as cloudinary } from "cloudinary";
cloudinary.config(process.env.CLOUDINARY_URL || "")
//asd
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
  const { hight, width, startTime, duration } = JSON.parse(data?.fields.configs)

  // .complexFilter(
  //   ["scale=fps=15,scale=320:-1:flags=lanczos  [x]; [x][1:v] paletteuse"]
  // )
  const palette = "public/pixel.png"
  const filters = `fps=30,scale=${width}:-1:flags=lanczos`
  try {
    //creo el pixel
    ffmpeg({ source: file })
      .outputOptions([
        `-i ${file}`,
        `-vf`,
        `${filters},palettegen`
      ])
      .output("public/pixel.png")
      .run()

    // ffmpeg({ source: file ).video
    //lo uso
    ffmpeg({ source: file })
      .outputOptions([
        `-i ${palette}`,
        `-lavfi`,
        `${filters} [x];[x][1:v] paletteuse`
      ])
      .setStartTime(startTime)
      .setDuration(duration)
      .output("public/image.gif")
      .on('progress', function (progress) {
        console.log('Processing: ' + progress.percent + '% done');
      })
      .on('end', async (stdout, stderr) => {
        console.log({ stdout });

        //todo borrar lo anterior
        const { secure_url: secureURL } = await cloudinary.uploader.upload(
          "public/image.gif",
        );
        return res.json({ newPath: secureURL })
      })
      .run()


  } catch (error: any) {
    console.log("Error", error);
    return res.json(error.message);
  }
}
