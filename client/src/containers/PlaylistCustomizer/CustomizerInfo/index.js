import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FontAwesomeIcon as FaIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import propTypes from 'prop-types';

import { capitalCase } from '../utils.js';
import { PLAYLIST_METADATA } from '../../../constants.global.js';
import {
  KEY_SELECT_TYPE_GENRE,
  KEY_SELECT_TYPE_PRESET,
  KEY_SELECT_TYPE_AGE_RANGE,
} from '../customizerOptions.js';

import './index.css';

const InfoTitle = ({ children }) => {
  return <div className="info-title">{children}</div>;
};

const InfoSubtext = ({ children }) => {
  return <div className="info-subtext">{children}</div>;
};

const InfoContainer = ({ children }) => {
  return (
    <div className="customizer-info">
      <h2 contentEditable suppressContentEditableWarning id="playlist-name">Playlist Name Here</h2>
      {children}
    </div>
  );
};

const InfoItem = ({ children, onItemDelete }) => {
  return (
    <div className="item-container">
      {children}
      <button onClick={onItemDelete} style={{borderLeft: '#ccc solid 1px'}}>
        <FaIcon icon={faTimes} />
      </button>
    </div>
  );
};

const PlaylistTypeTooltip = ({ text }) => {
  if (!text) {
    return null;
  }

  const tooltip = <Tooltip id="playlist-tooltip">{text}</Tooltip>;
  return (
    <OverlayTrigger placement="right" delayShow={50} overlay={tooltip}>
      <FaIcon icon={faQuestionCircle} id="playlist-type-tooltip" />
    </OverlayTrigger>
  );
};

const Preset = ({ preset, onItemDelete }) => {
  const { title, tooltip } = PLAYLIST_METADATA[preset];
  return (
    <InfoItem onItemDelete={onItemDelete}>
      <InfoTitle>
        Preset of {title} <PlaylistTypeTooltip text={tooltip} />
      </InfoTitle>
    </InfoItem>
  );
};

const Genre = ({ genres, onItemDelete }) => {
  if (!genres || genres.length === 0) {
    return null;
  }
  return (
    <InfoItem onItemDelete={onItemDelete}>
      <InfoTitle>Genre is {genres.map(capitalCase).join(' / ')}</InfoTitle>
    </InfoItem>
  );
};

const TimeAdded = ({ ageRanges, onItemDelete }) => {
  if (!ageRanges || ageRanges.length === 0) {
    return null;
  }
  const { high, low } = ageRanges[0];
  return (
    <InfoItem onItemDelete={onItemDelete}>
      <InfoTitle>
        Track was added {low} - {high} days ago
      </InfoTitle>
    </InfoItem>
  );
};

// Component to take render information in builderConfig
const CustomizerInfo = ({ builder, onItemDelete }) => {
  if (!builder || builder.isEmpty()) {
    return null;
  }
  const { config } = builder;

  const onItemDeleteForKey = configKey => {
    return () => onItemDelete(configKey);
  };
  const { preset, genres, ageRanges } = config;

  // Preset takes precedence
  if (preset) {
    return (
      <InfoContainer>
        <Preset
          preset={config.preset}
          onItemDelete={onItemDeleteForKey(KEY_SELECT_TYPE_PRESET)}
        />
        <InfoSubtext>
          Note: Presets take precedence over other customizations. They cannot
          be combined with other customizations right now!
        </InfoSubtext>
      </InfoContainer>
    );
  }

  return (
    <InfoContainer>
      <Genre
        genres={genres}
        onItemDelete={onItemDeleteForKey(KEY_SELECT_TYPE_GENRE)}
      />
      <TimeAdded ageRanges={ageRanges} onItemDelete={onItemDeleteForKey(KEY_SELECT_TYPE_AGE_RANGE)}/>

      <InfoSubtext>
        psst! You can add more customizations for your own special sauce
        playlist!
      </InfoSubtext>
    </InfoContainer>
  );
};
CustomizerInfo.propTypes = {
  onItemDelete: propTypes.func.isRequired,
  builder: propTypes.object.isRequired,
};

export default CustomizerInfo;
