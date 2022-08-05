import { Box, Button, FormLabel, Grid, Input, Stack, Text, } from '@chakra-ui/react';

import type { NextPage } from 'next'
import Image from 'next/image';
import { useRef, useState } from 'react';
import ReactPlayer from 'react-player'

interface InputFields {
  width: number;
  startTime: string;
  duration: string;
}

const Home: NextPage = () => {
  const [loader, setLoader] = useState(false)
  const [metadataVideo, setMetadataVideo] = useState({
    width: "",
    height: "",
    duration: 0,
  })
  const playerRef = useRef<any>();
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>("")
  const [video, setVideo] = useState()
  const [videoBlob, setVideoBlob] = useState()

  // const [dimensionGifResult, setDimensionGifResult] = useState<{ width: string, height: string }>({
  //   width: "",
  //   height: ""
  // })
  const [inputFields, setInputFields] = useState<InputFields>({
    width: 0,
    startTime: '00:00:00',
    duration: '0',
  })
  const { width, startTime, duration } = inputFields;

  const inputOnChange = ({ target }: any) => {
    setInputFields({
      ...inputFields,
      [target.name]: target.value
    })
  }

  // const onReady = useCallbackRef(() => {
  //   const timeToStart = 12;
  //   playerRef.current.seekTo(timeToStart, 'seconds');
  // }, [playerRef.current]);

  const videoOnChange = async (event: any) => {
    const videoFile = event.target.files[0]

    setVideo(videoFile)
    let blobURL = URL.createObjectURL(videoFile) as any;
    setVideoBlob(blobURL)

    const formData = new FormData();

    formData.append("inputFile", videoFile);

    const response = await fetch("/api/hello?todo=getDimensionsCurrentVideo", {
      method: "POST",
      body: formData
    });

    const metadataVideo = await response.json()
    setMetadataVideo(metadataVideo)
    setInputFields({
      ...inputFields,
      width: metadataVideo.width
    })

  }

  const submit = async (event: any) => {
    setLoader(true)
    event.preventDefault();
    const formData = new FormData();
    console.log(video);

    formData.append("inputFile", video!);
    formData.append("configs", JSON.stringify(inputFields));

    const response = await fetch("/api/hello?todo=convertVideoToGif", {
      method: "POST",
      body: formData
    });

    const pathOfCloudinary = await response.json()
    // setMetadataVideo(pathOfCloudinary.dimension)

    if (pathOfCloudinary.newPath) {
      setLoader(false)
      setCloudinaryUrl(pathOfCloudinary.newPath)
    }
  };


  return (
    <Stack justifyContent='center' alignItems='center' minH='100vh'>
      <Grid gridTemplateColumns="repeat(2,1fr)" gap='8'>
        <Stack>

          <form onSubmit={submit}>
            <Input type="file" onChange={videoOnChange} />
            <FormLabel>
              Comenzar a cortar desde
              <Input type='time' step="2" name='startTime' value={startTime} onChange={inputOnChange} />
            </FormLabel>
            <FormLabel>
              Quiero que el gif dure
              <Input type='text' placeholder='10' name='duration' value={duration} onChange={inputOnChange} />
              segundos
            </FormLabel>
            <FormLabel>
              Ancho
              <Input
                type="text"
                placeholder='Ancho'
                onChange={inputOnChange}
                value={width}
                name='width' />
            </FormLabel>
            <Button type='submit'>
              {loader ? <Text>TirandoMagia...</Text> : " Convertir video a Gif"}
            </Button>
          </form>
        </Stack>

        {
          videoBlob && (
            <>
              <ReactPlayer url={videoBlob} ref={playerRef} playing controls />
            </>
          )
        }

        <Stack>
          {cloudinaryUrl &&
            <Box>
              <Image src={cloudinaryUrl} alt='joder' layout='responsive' width={metadataVideo!.width} height={metadataVideo!.height} objectFit='cover' />
            </Box>}
          {
            !loader && <a
              href={cloudinaryUrl}
              target="_blank"
              rel="noopener noreferrer" download>
              <Button>
                Descargar Gif
              </Button>

            </a>
          }
          {
            metadataVideo.width && (
              <Stack>
                <Text>Ancho nativo del video : {metadataVideo?.width}</Text>
                <Text> Alto nativo del video : {metadataVideo?.height}</Text>
                <Text> Duración del video : {metadataVideo?.duration.toString().split('.')[0]} segundos</Text>
              </Stack>
            )
          }

        </Stack>
      </Grid>

    </Stack >
  )
}

export default Home
