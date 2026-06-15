import React from 'react';
import { ReactNode } from 'react';

type Props = {
  html: string;
};

export default function samengine({ html }: Props ) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
