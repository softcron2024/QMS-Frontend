import React from 'react';
import { QrReader as OriginalQrReader } from 'react-qr-reader';

const WrappedQrReader = ({ delay = 300, facingMode = 'environment', ...props }) => {
  return <OriginalQrReader delay={delay} facingMode={facingMode} {...props} />;
};

export default WrappedQrReader;
