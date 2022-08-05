import { IncomingForm } from 'formidable';
import type { NextApiRequest, NextApiResponse } from 'next'
import ffmpeg from 'fluent-ffmpeg'
import sizeOf from 'image-size'
import { v2 as cloudinary } from "cloudinary";
cloudinary.config(process.env.CLOUDINARY_URL || "")

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  console.log(req.query.todo);

  switch (req.query.todo) {
    case 'convertVideoToGif':
      convertVideoToGif(req, res)
      break;
    case 'getDimensionsCurrentVideo':
      getDimensionsCurrentVideo(req, res)
      break;

    default:
      break;
  }

}

const convertVideoToGif = async (req: NextApiRequest,
  res: NextApiResponse<any>) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);

      resolve({ fields, files });
    });
  }) as any;



  const file = data?.files?.inputFile.filepath;
  console.log(file);

  const { width, startTime, duration } = JSON.parse(data?.fields.configs)

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
      .on('end', async () => {
        let { width, height } = sizeOf('public/image.gif');

        //todo borrar lo anterior
        const { secure_url: secureURL } = await cloudinary.uploader.upload(
          "public/image.gif",
        );
        return res.json({
          newPath: secureURL
        })
      })
      .run()

  } catch (error: any) {
    console.log("Error", error);
    return res.json(error.message);
  }
}

const getDimensionsCurrentVideo = async (req: NextApiRequest,
  res: NextApiResponse<any>) => {

  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);

      resolve({ fields, files });
    });
  }) as any;
  const file = data?.files?.inputFile.filepath;

  ffmpeg.ffprobe(file, function (err, metadata) {

    return res.status(200).json({
      width: metadata.streams[0].width,
      height: metadata.streams[0].height,
      duration: metadata.streams[0].duration,

    })
  })

}
