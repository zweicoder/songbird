import React from 'react';

const InfoTitle = ({ children }) => {
  return <div className="info-title">{children}</div>;
};

const InfoSubtext = ({ children }) => {
  return <div className="info-subtext">{children}</div>;
};

const Preset = ({ preset }) => {
  return (
    <div>
      <InfoTitle>Preset of {preset}</InfoTitle>
      <InfoSubtext>
        Note: Presets take precedence over other filters. They cannot be
        combined with other filters right now!
      </InfoSubtext>
    </div>
  );
};

const Genre = ({ genres }) => {
  if (!genres) {
    return null;
  }
  return (
    <div>
      <InfoTitle>Genre is in [{genres.toString()}]</InfoTitle>
    </div>
  );
};

// Component to take render information in builderConfig
const CustomizerInfo = ({ config }) => {
  if (!config) {
    return null;
  }

  const { preset, genres } = config;
  // Preset takes precedence
  if (preset) {
    return <Preset preset={config.preset} />;
  }

  // TODO other customizations
  return (
    <div>
      <Genre genres={genres} />
    </div>
  );
};

export default CustomizerInfo;
