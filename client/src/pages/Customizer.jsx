import React, {useState, useEffect} from 'react'
import {AnimatePresence, motion} from 'framer-motion';
import { useSnapshot } from 'valtio';
import config from '../config/config'
import state from '../store';
import {download} from '../assets'
import {downloadCanvasToImage, reader} from '../config/helpers'
import { EditorTabs, DecalTypes, FilterTabs, Download } from '../config/constants';
import {fadeAnimation, slideAnimation} from '../config/motion'
import Tab from '../components/Tab'
import CustomButton from '../components/CustomButton'
import ColorPicker from '../components/ColorPicker'
import FilePicker from '../components/FilePicker'
import AIPicker from '../components/AIPicker'

const Customizer = () => {
  
  const snap = useSnapshot(state)

  const [file, setFile] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generatingImg, setGeneratingImg] = useState(false)

  const [activeEditorTab, setActiveEditorTab] = useState()
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false
  })

  //show tab info based on active
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case 'colorpicker':
        return <ColorPicker/>
      case 'filepicker':
        return <FilePicker
          file={file}
          setFile={setFile}
          readFile={readFile}
        />
      case 'aipicker':
        return <AIPicker
          prompt={prompt}
          setPrompt={setPrompt}
          generatingImg={generatingImg}
          handleSubmit={handleSubmit}
        />
      default:
        return null;
    }
  }

  const handleSubmit = async (type) => {
    if(!prompt) return alert("Please enter the prompt!")

    try {
      setGeneratingImg(true);
    
      const response = await fetch('https://threed-tshirt-fgrm.onrender.com/api/v1/dalle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });
    
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    
      const data = await response.json();
      handleDecal(type, `data:image/png;base64,${data.photo}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Check the console for details.");
    } finally {
      setGeneratingImg(false);
      setActiveEditorTab("");
    }
  }    

  const handleDecal = (type, res) => {
    const decalType = DecalTypes[type]

    state[decalType.stateProperty] = res

    if(!activeFilterTab[decalType.filterTab]){
      handleActiveFilterTab(decalType.filterTab)
    }
  }

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case "logoShirt":
          state.isLogoTexture = !activeFilterTab[tabName];
        break;
      case "stylishShirt":
          state.isFullTexture = !activeFilterTab[tabName];
        break;
      default:
        state.isLogoTexture = true;
        state.isFullTexture = false;
        break;
    }

    // after setting state change the activeFilterTAb

    setActiveFilterTab((prevState) => {
      return{
        ...prevState,
        [tabName]: !prevState[tabName]
      }
    })
  }

  const readFile = (type) => {
    reader(file)
      .then((res) => {{
        handleDecal(type, res)
        setActiveEditorTab("")
    }})
  }


  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key='custom'
            className='absolute top-0 left-0 z-10'
            {...slideAnimation('left')}
          >
            <div className='flex items-center min-h-screen'>
              <div className='editortabs-container tabs'>
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={()=>{setActiveEditorTab(tab.name)}}
                  />
                ))}

                {generateTabContent()}
              </div>
            </div>
          </motion.div>

          <motion.div
            className='absolute z-10 top-5 right-5'
            {...fadeAnimation}
          >
            <CustomButton
              type='filled'
              title='Go Back'
              handleClick={()=> state.intro = true}
              customStyles='w-fit px-4 py-2.5 font-bold text-sm'
            />
          </motion.div>

          <motion.div
            className='filtertabs-container tabs'
            {...slideAnimation('up')}
          >
            {FilterTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    isFilterTab
                    isActiveTab={activeFilterTab[tab.name]}
                    handleClick={()=> handleActiveFilterTab(tab.name)}
                  />
                ))}

             {Download.map((tab)=>(
                <Tab
                  tab={tab}
                  key={tab.name}
                  isActiveTab={activeFilterTab[tab.name]}
                  handleClick={() => downloadCanvasToImage()}
                />
             ))} 
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Customizer
