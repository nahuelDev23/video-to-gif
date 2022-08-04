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
  const filters = "fps=15,scale=320:-1:flags=lanczos"
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

    //lo uso
    ffmpeg({ source: file })
      .outputOptions([
        `-i ${palette}`,
        `-lavfi`,
        `${filters} [x];[x][1:v] paletteuse`
      ])
      .setStartTime(startTime)
      .setDuration(duration)
      // .size(`${width}x${hight}`)//w/h
      .output("public/image.gif")
      .on('end', async () => {
        //todo borrar lo anterior
        const { secure_url: secureURL } = await cloudinary.uploader.upload(
          "public/image.gif",
        );
        return res.json({ newPath: secureURL })
      })
      .run()
    // ffmpeg({ source: file })
    //   .on('error', (err) => {
    //     console.log(err);
    //   })
    //   .setStartTime(startTime)
    //   .setDuration(duration)
    //   // .outputOptions([
    //   //   "-vf ",
    //   //   "-filter fps=15,scale=500:-1:flags=lanczos",
    //   //   "-y /public/palette.png",
    //   // ])
    //   .size(`${width}x${hight}`)//w/h
    //   .fps(10)
    //   .output("public/vertical.gif")
    //   .on('end', async () => {
    //     //todo borrar lo anterior
    //     // const { secure_url: secureURL } = await cloudinary.uploader.upload(
    //     //   "public/vertical.gif",
    //     // );
    //     // return res.json({ newPath: secureURL })
    //     return res.json({ newPath: 'asdasdd' })
    //   })
    //   .run()

  } catch (error: any) {
    console.log("Error", error);
    return res.json(error.message);
  }
}
