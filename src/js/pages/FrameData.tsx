import { IonContent, IonPage, IonIcon, createGesture } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DataTable from '../components/DataTable';
import SegmentSwitcher from '../components/SegmentSwitcher';
import SubHeader from '../components/SubHeader';
import LandscapeOptions from '../components/LandscapeOptions';
import PageHeader from '../components/PageHeader';
import { setActiveFrameDataPlayer, setModalVisibility, setPlayerAttr, setPlayer, setLandscapeCols } from '../actions';
import { useHistory, useParams } from 'react-router';
import { informationCircle } from 'ionicons/icons';
import AdviceToast from '../components/AdviceToast';
import { APP_CURRENT_VERSION_CODE } from '../constants/VersionLogs';
import { activeGameSelector, activePlayerSelector, autoSetSpecificColsSelector, gameDetailsSelector, landscapeColsSelector, modalVisibilitySelector, selectedCharactersSelector } from '../selectors';
import { FrameDataSlug } from '../types';
import { handleNewCharacterLandscapeCols } from '../utils/landscapecols';
import { isPlatform } from '@ionic/core/components';
import FrameDataSubHeader from '../components/FrameDataSubHeader';
import { createSegmentSwitcherObject } from '../utils/segmentSwitcherObject';



const FrameData = () => {
  
  const modalVisibility = useSelector(modalVisibilitySelector);
  const selectedCharacters = useSelector(selectedCharactersSelector);
  const activePlayer = useSelector(activePlayerSelector);
  const activeGame = useSelector(activeGameSelector);
  const landscapeCols = useSelector(landscapeColsSelector);
  const autoSetSpecificCols = useSelector(autoSetSpecificColsSelector);
  const gameDetails = useSelector(gameDetailsSelector);

  const [searchText, setSearchText] = useState('');

  const dispatch = useDispatch();
  
  const history = useHistory();
  const slugs: FrameDataSlug = useParams();



  useEffect(() => {
    (async () => {

      if (selectedCharacters["playerOne"].name !== slugs.characterSlug) {
        console.log("URL character mismatch");
        if (activeGame === slugs.gameSlug) {
          // this has to be dispatched twice to wipe both old characers cols out of the obj
          dispatch(setLandscapeCols(handleNewCharacterLandscapeCols(gameDetails, selectedCharacters["playerOne"].name, slugs.characterSlug, autoSetSpecificCols, landscapeCols)));
          dispatch(setLandscapeCols(handleNewCharacterLandscapeCols(gameDetails, selectedCharacters["playerTwo"].name, slugs.characterSlug, autoSetSpecificCols, landscapeCols)));
        }
        dispatch(setPlayer("playerOne", slugs.characterSlug));
      }
      if (!localStorage.getItem("lsCurrentVersionCode") || parseInt(localStorage.getItem("lsCurrentVersionCode")) < APP_CURRENT_VERSION_CODE) {
        localStorage.setItem("lsCurrentVersionCode", APP_CURRENT_VERSION_CODE.toString());
        dispatch(setModalVisibility({ currentModal: "whatsNew", visible: true }))
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // use useRef instead
  let DataTableEl = document.getElementById('dataTable');
  const gesture = createGesture({
    el: DataTableEl,
    threshold: 50,
    gestureName: 'table-swipe',
    onMove: detail => onSwipeHandler(detail)
  });

  const onSwipeHandler = (detail) => {
    if (detail.startX > window.screen.width /2 && detail.currentX < window.screen.width /2 && activePlayer === "playerOne") {
      console.log("swiping left")
      dispatch(setLandscapeCols(handleNewCharacterLandscapeCols(gameDetails, selectedCharacters["playerOne"].name, selectedCharacters["playerTwo"].name, autoSetSpecificCols, landscapeCols)));
      dispatch(setActiveFrameDataPlayer("playerTwo"));
      gesture.enable(false)
    } else if (detail.startX < window.screen.width /2 && detail.currentX > window.screen.width /2 && activePlayer === "playerTwo") {
      console.log("swiping right")
      dispatch(setLandscapeCols(handleNewCharacterLandscapeCols(gameDetails, selectedCharacters["playerTwo"].name, selectedCharacters["playerOne"].name, autoSetSpecificCols, landscapeCols)));
      dispatch(setActiveFrameDataPlayer("playerOne"));
      gesture.enable(false)
    }
  }

  useEffect(() => {
    if (DataTableEl) {
      gesture.enable();
      return () => {gesture.enable(false)}
    }
  }, [gesture, DataTableEl])

  const searchBoxMessages = [`Search ${selectedCharacters[activePlayer].name}`, 'Type a move name', 'Try searching s=4', 'Try searching a>3', 'Try searching r<10', 'Try searching oH>=3', 'Try searching xx=sp', 'Try searching info=fully inv', 'Try searching oB<=-4', 'FAT supports: =, >, <, >=, <=']

  return (
    <IonPage id="frameData">
      <PageHeader
        componentsToShow={{menu: true, popover: true, search: true}}
        title={searchBoxMessages[Math.floor(Math.random() * searchBoxMessages.length)]}
        searchText={searchText}
        onSearchHandler={ (text: string) => setSearchText(text)}
      />
      <IonContent>
        <SubHeader
          adaptToShortScreens={true}
          hideOnWideScreens={true}
          rowsToDisplay={activeGame !== "GGST" ? 
            [
              [
                <><b>Health</b><br />{selectedCharacters[activePlayer].stats.health}</>,
                <><b>Stun</b><br />{selectedCharacters[activePlayer].stats.stun}</>,
                <div onClick={() => {history.push(`/stats/${selectedCharacters[activePlayer].name}`)}}><b>Tap for more</b><br /><IonIcon icon={informationCircle} /></div>
              ],
              [
                <><b>Fwd Dash</b><br />{selectedCharacters[activePlayer].stats.fDash}</>,
                <><b>Back Dash</b><br />{selectedCharacters[activePlayer].stats.bDash}</>,

              ]
            ]
          :
            [
              [
                <><b>Defense</b><br />{selectedCharacters[activePlayer].stats.defense}</>,
                <><b>Guts</b><br />{selectedCharacters[activePlayer].stats.guts}</>,
                <div onClick={() => {history.push(`/stats/${selectedCharacters[activePlayer].name}`)}}><b>Tap for more</b><br /><IonIcon icon={informationCircle} /></div>
              ],
              [
                <><b>Weight</b><br />{selectedCharacters[activePlayer].stats.weight}</>,
                <><b>Back Dash</b><br />{selectedCharacters[activePlayer].stats.backdashSpeed}</>,
              ]
            ]
          }
        />
        <FrameDataSubHeader
          charName={selectedCharacters[activePlayer].name}
          charStats={selectedCharacters[activePlayer].stats}
          activeGame={activeGame}        
        />
        <div className={`segments ${!isPlatform("ios") && "md"}`}>
          <SegmentSwitcher
            key={"FD ActivePlayer"}
            segmentType={"active-player"}
            valueToTrack={activePlayer}
            labels={ {playerOne: `P1: ${selectedCharacters.playerOne.name}`, playerTwo: `P2: ${selectedCharacters.playerTwo.name}`}}
            clickFunc={ (eventValue) => {
              if (!modalVisibility.visible && eventValue === activePlayer) {
                dispatch(setModalVisibility({ currentModal: "characterSelect", visible: true }));
              } else {
                dispatch(setLandscapeCols(handleNewCharacterLandscapeCols(gameDetails, selectedCharacters[activePlayer].name, selectedCharacters[eventValue].name, autoSetSpecificCols, landscapeCols)));
                dispatch(setActiveFrameDataPlayer(eventValue));
              }
            }}
          />
          {activeGame === "SFV" ?
            <SegmentSwitcher
              segmentType={"vtrigger"}
              valueToTrack={selectedCharacters[activePlayer].vtState}
              labels={ {normal: "Normal", vtOne: "V-Trigger I" , vtTwo: "V-Trigger II"} }
              clickFunc={ (eventValue) => dispatch(setPlayerAttr(activePlayer, selectedCharacters[activePlayer].name, {vtState: eventValue})) }
            />
          : (activeGame === "GGST") ?
            <SegmentSwitcher
              segmentType={"vtrigger"}
              valueToTrack={selectedCharacters[activePlayer].vtState}
              labels={createSegmentSwitcherObject(gameDetails.specificCharacterStates[selectedCharacters[activePlayer].name])}
              clickFunc={ (eventValue) => dispatch(setPlayerAttr(activePlayer, selectedCharacters[activePlayer].name, {vtState: eventValue})) }
            />
          : (activeGame === "SF6") &&
          <SegmentSwitcher
            segmentType={"vtrigger"}
            valueToTrack={selectedCharacters[activePlayer].vtState}
            labels={createSegmentSwitcherObject(gameDetails.specificCharacterStates[selectedCharacters[activePlayer].name])}
            clickFunc={ (eventValue) => dispatch(setPlayerAttr(activePlayer, selectedCharacters[activePlayer].name, {vtState: eventValue})) }
          />
          }
        </div>
        


        <DataTable searchText={searchText} previewTable={false} />

        <AdviceToast />
      </IonContent>
      <LandscapeOptions />
    </IonPage>
  );
};

export default FrameData;
