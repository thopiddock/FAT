import { IonContent, IonPage, IonList, IonItem, IonLabel, IonIcon, isPlatform, IonGrid } from '@ionic/react';
import React from 'react';
import { connect } from 'react-redux';
import PageHeader from '../components/PageHeader';
import { chevronForward, desktopOutline, documentTextOutline, logoDiscord, logoTwitter, chatbubblesOutline, heartOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { RES_MENU_LIST } from '../constants/MenuLists';


const MoreResources = () => {
  let history = useHistory();
  
  const icons = { desktopOutline, documentTextOutline, logoDiscord, logoTwitter, chatbubblesOutline, heartOutline };
  const getIcon = (iconAsString) => {
    return icons[iconAsString];
  }

  return (
    <IonPage>
      <PageHeader
        componentsToShow={{menu: true, popover: false}}
        title="More Resources"
      />

      <IonContent className="calculators">
        <IonGrid fixed>
          <IonList>
          {Object.keys(RES_MENU_LIST).map(resItem =>
            <IonItem key={`${resItem}-resItem`} lines="full" onClick={() => history.push(`/moreresources/${RES_MENU_LIST[resItem].url}`)} button>
              <IonLabel>
                <h2>{resItem}</h2>
                <p>{RES_MENU_LIST[resItem].desc}</p>
              </IonLabel>
              <IonIcon icon={getIcon(RES_MENU_LIST[resItem].icon)} slot="start" />
              {!isPlatform("ios") &&
                <IonIcon icon={chevronForward} slot="end" />
              }
            </IonItem>
          )}
          </IonList>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
}

const mapStateToProps = state => ({
})

const mapDispatchToProps = dispatch => ({
})


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)
(MoreResources)
