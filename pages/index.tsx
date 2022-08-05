import { Box, Button, FormLabel, Grid, Input, Stack, Text } from '@chakra-ui/react';
import type { NextPage } from 'next'
import Image from 'next/image';
import { useState } from 'react';



interface InputFields {
  width: number;
  startTime: string;
  duration: string;
}
const Home: NextPage = () => {
  const [loader, setLoader] = useState(false)
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>("")
  const [video, setVideo] = useState()
  const [dimensionGifResult, setDimensionGifResult] = useState<{ width: string, height: string }>({
    width: "",
    height: ""
  })
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

  const videoOnChange = (event: any) => {
    setVideo(event.target.files[0])
  }
  const submit = async (event: any) => {
    setLoader(true)
    event.preventDefault();
    const formData = new FormData();

    formData.append("inputFile", video!);
    formData.append("configs", JSON.stringify(inputFields));

    const response = await fetch("/api/hello", {
      method: "POST",
      body: formData
    });

    const pathOfCloudinary = await response.json()
    setDimensionGifResult(pathOfCloudinary.dimension)

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
        <Stack>


          {cloudinaryUrl &&
            <Box >
              < Image src={cloudinaryUrl} alt='joder' layout='responsive' width={dimensionGifResult!.width} height={dimensionGifResult!.height} objectFit='cover' />
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
        </Stack>
      </Grid>

    </Stack>
  )
}

export default Home
