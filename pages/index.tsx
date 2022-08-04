import { Button, Stack, Text } from '@chakra-ui/react';
import type { NextPage } from 'next'
import { useState } from 'react';



interface InputFields {
  hight: number;
  width: number;
  startTime: string;
  duration: string;
}
const Home: NextPage = () => {
  const [loader, setLoader] = useState(false)
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>("")
  const [inputFields, setInputFields] = useState<InputFields>({
    hight: 0,
    width: 0,
    startTime: '00:00:00',
    duration: '0',
  })
  const { hight, width, startTime, duration } = inputFields;

  const inputOnChange = ({ target }: any) => {
    setInputFields({
      ...inputFields,
      [target.name]: target.value
    })
  }

  const onChange = async (event: any) => {
    setLoader(true)
    event.preventDefault();
    const formData = new FormData();
    const file = event.target.files[0];

    formData.append("inputFile", file);
    formData.append("configs", JSON.stringify(inputFields));

    const response = await fetch("/api/hello", {
      method: "POST",
      body: formData
    });

    const pathOfCloudinary = await response.json()


    if (pathOfCloudinary.newPath) {
      setLoader(false)
      setCloudinaryUrl(pathOfCloudinary.newPath)
    }
  };


  return (
    <Stack justifyContent='center' alignItems='center' minH='100vh'>

      <input type="file" onChange={onChange} />
      {loader && <Text>TirandoMagia...</Text>}
      <label>
        Comenzar a cortar desde
        <input type='time' step="2" name='startTime' value={startTime} onChange={inputOnChange} />
      </label>
      <label>
        Quiero que el gif dure
        <input type='text' placeholder='10' name='duration' value={duration} onChange={inputOnChange} />
        segundos
      </label>
      <label>
        Alto
        <input
          type="text"
          placeholder='Alto'
          onChange={inputOnChange}
          value={hight} name='hight' />
      </label>
      <label>
        Ancho
        <input
          type="text"
          placeholder='Ancho'
          onChange={inputOnChange}
          value={width} name='width' />
      </label>

      {
        !loader && <a
          href={cloudinaryUrl}
          target="_blank"
          rel="noopener noreferrer" download>
          <Button>
            Click para ver nudes
          </Button>

        </a>
      }


    </Stack>
  )
}

export default Home
