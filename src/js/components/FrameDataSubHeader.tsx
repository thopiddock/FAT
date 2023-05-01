import SegmentSwitcher from "./SegmentSwitcher";
import '../../style/components/FrameDataSubHeader.scss'
import { IonCol, IonGrid, IonRow } from "@ionic/react";
import CharacterPortrait from "./CharacterPortrait";
import { useEffect, useState } from "react";
import { GameName, PlayerData } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { setModalVisibility, setPlayerAttr } from "../actions";
import { activePlayerSelector, dataDisplaySettingsSelector, frameDataSelector, gameDetailsSelector, selectedCharactersSelector } from "../selectors";
import { useHistory } from "react-router";

type FrameDataSubHeaderProps = {
  charName: PlayerData["name"],
  charStats: PlayerData["stats"],
  activeGame: GameName
}

const FrameDataSubHeader = ({ charName, charStats, activeGame }: FrameDataSubHeaderProps) => {
	
	const [statCategory, setStatCategory] = useState("The Basics");

	const dispatch = useDispatch();
	let history = useHistory();
	

	const frameData = useSelector(frameDataSelector);
	const gameDetails = useSelector(gameDetailsSelector);
	const dataDisplaySettings = useSelector(dataDisplaySettingsSelector);
	const selectedCharacters = useSelector(selectedCharactersSelector);
	const activePlayer = useSelector(activePlayerSelector);
	const moveNotation = 
		dataDisplaySettings.moveNameType === "common"
			? "cmnName"
		: dataDisplaySettings.inputNotationType

	const labelObj = {}
	Object.keys(gameDetails.statsPoints).map(keyName => labelObj[keyName] = keyName)

	useEffect(() => {
		setStatCategory("The Basics");
	},[activeGame])

	return (
		<IonGrid id="frameDataSubHeader">
			<IonRow>
				<IonCol className ="character-portrait-container" size="1.6">
					<CharacterPortrait charName={charName} game={activeGame} charColor={charStats.color as string} remoteImage={charStats.remoteImage as unknown as Boolean} showName={false}
						onClick={() => dispatch(setModalVisibility({ currentModal: "characterSelect", visible: true })) }
					/>
				</IonCol>
				<IonCol className="character-bio">
					<h1>{charStats.longName ? charStats.longName : charName}</h1>
					<h2>{charStats.phrase}</h2>
				</IonCol>
			</IonRow>
			<SegmentSwitcher
				key={"Stat Chooser"}
				segmentType={"stat-chooser"}
				valueToTrack={statCategory}
				labels={ labelObj }
				clickFunc={ (eventValue) => setStatCategory(eventValue) }
			/>
			<IonRow className="stat-row">
				{gameDetails.statsPoints[statCategory] && 
					gameDetails.statsPoints[statCategory].map(dataRowObj =>
						Object.keys(dataRowObj).map(statKey =>
							charStats[statKey] && charStats[statKey] !== "~" &&
								<IonCol key={`stat-entry-${statKey}`} className="stat-entry" style={statKey === "bestReversal" || statKey === "fastestNormal" ? { cursor: "pointer" } : {}}
									onClick={() => {
										if (statKey === "bestReversal") {
											dispatch(setPlayerAttr(activePlayer, selectedCharacters[activePlayer].name, {selectedMove: frameData[charName].moves.normal[charStats[statKey]][moveNotation]}));
											history.push(`/framedata/movedetail/${activeGame}/${selectedCharacters[activePlayer].name}/${selectedCharacters[activePlayer].vtState}/${charStats[statKey]}`)
										} else if (statKey === "fastestNormal") {
											let fastestNormalName: string;
											Object.keys(frameData[charName].moves.normal).filter(moveEntry => {
												if (
													frameData[charName].moves.normal[moveEntry].moveType === "normal" &&
													!frameData[charName].moves.normal[moveEntry].airmove &&
													frameData[charName].moves.normal[moveEntry].startup == charStats[statKey][0]
												) {
													fastestNormalName = moveEntry
												}
											})
											dispatch(setPlayerAttr(activePlayer, selectedCharacters[activePlayer].name, {selectedMove: frameData[charName].moves.normal[fastestNormalName][moveNotation]}));
											history.push(`/framedata/movedetail/${activeGame}/${selectedCharacters[activePlayer].name}/${selectedCharacters[activePlayer].vtState}/${fastestNormalName}`)
										}
									}}
								>
								<h2>
									{
										statKey === "bestReversal" && frameData[charName] && frameData[charName].moves.normal[charStats[statKey]]
											? frameData[charName].moves.normal[charStats[statKey]][moveNotation]								
											: charStats[statKey]
									}
								</h2>
								<p>{dataRowObj[statKey]}</p>
							</IonCol>
						)
					)
				}
			</IonRow>
		</IonGrid>
	)
}

export default FrameDataSubHeader;