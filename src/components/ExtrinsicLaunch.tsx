// Copyright 2017-2021 @polkadot/app-extrinsics authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { Button, Extrinsic, InputAddress, MarkError, Output, TxButton } from '@polkadot/react-components';
// import { useApi } from '@polkadot/react-hooks';
import { BalanceFree } from '@polkadot/react-query';
import { u8aToHex } from '@polkadot/util';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks';

interface Props {
  className?: string;
}

export function ExtrinsicLaunch({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic<'promise'> | null>(null);

  const _onExtrinsicChange = useCallback(
    (method?: SubmittableExtrinsic<'promise'>) => setExtrinsic(() => method || null),
    []
  );

  const _onExtrinsicError = useCallback((err?: Error | null) => setError(err ? err.message : null), []);

  const [extrinsicHex, extrinsicHash] = useMemo((): [string, string] => {
    if (!extrinsic) {
      return ['0x', '0x'];
    }

    const u8a = extrinsic.method.toU8a();

    // don't use the built-in hash, we only want to convert once
    return [u8aToHex(u8a), extrinsic.registry.hash(u8a).toHex()];
  }, [extrinsic]);

  return (
    <div className={className}>
      <InputAddress
        label={t<string>('using the selected account')}
        labelExtra={<BalanceFree label={<label>{t<string>('free balance')}</label>} params={accountId} />}
        onChange={setAccountId}
        type="account"
      />
      <Extrinsic
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        defaultValue={api!.tx.system.setCode}
        label={t<string>('submit the following extrinsic')}
        onChange={_onExtrinsicChange}
        onError={_onExtrinsicError}
      />
      <Output isDisabled isTrimmed label="encoded call data" value={extrinsicHex} withCopy />
      <Output isDisabled label="encoded call hash" value={extrinsicHash} withCopy />
      {error && !extrinsic && <MarkError content={error} />}
      <Button.Group>
        <TxButton
          extrinsic={extrinsic}
          icon="sign-in-alt"
          isUnsigned
          label={t<string>('Submit Unsigned')}
          withSpinner
        />
        <TxButton
          accountId={accountId}
          extrinsic={extrinsic}
          icon="sign-in-alt"
          label={t<string>('Submit Transaction')}
        />
      </Button.Group>
    </div>
  );
}
