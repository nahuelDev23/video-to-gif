import { Button, Stack } from '@chakra-ui/react';
import axios from 'axios'
import type { NextPage } from 'next'
import Link from 'next/link';
import { useState } from 'react';

import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const [loader, setLoader] = useState(false)
  const onChange = async (event: any) => {
    setLoader(true)
    event.preventDefault();
    const formData = new FormData();
    const file = event.target.files[0];
    console.log(event.target.files[0]);


    formData.append("inputFile", file);

    const response = await fetch("/api/hello", {
      method: "POST",
      body: formData
    });

    const x = await response.json()
    // console.log(x);
    setLoader(false)
    if (x.status === 200) {
      // let link = document.createElement("a");
      // link.href = "vertical.gif";
      // link.target = "_blank"
      // link.rel = "noopener noreferrer"
      // link.download = "vertical.gif"

      // link.click();
    }


  };


  return (
    <Stack justifyContent='center' alignItems='center' minH='100vh'>

      <input type="file" onChange={onChange} />
      {loader && 'TirandoMagia...'}

      {
        !loader && <a
          href="vertical.gif"
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
