'use client';

import { useEffect, useMemo, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { clientEnv } from '@/config/env.client';

type AuctionEventPayload = Record<string, unknown>;

type UseAuctionSocketOptions = {
  auctionId?: string;
  token?: string | null;
  onNewBid?: (payload: AuctionEventPayload) => void;
  onNotificationNew?: (payload: AuctionEventPayload) => void;
  onOutBid?: (payload: AuctionEventPayload) => void;
  onAuctionEnded?: (payload: AuctionEventPayload) => void;
  onAuctionWinnerChanged?: (payload: AuctionEventPayload) => void;
  onPaymentConfirmed?: (payload: AuctionEventPayload) => void;
  onAuctionCancelled?: (payload: AuctionEventPayload) => void;
  onAuctionDeleted?: (payload: AuctionEventPayload) => void;
};

const getSocketUrl = () => {
  const candidate =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    clientEnv.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    clientEnv.NEXT_PUBLIC_API_BASE_URL ||
    '';

  return candidate.replace(/\/$/, '');
};

const getPayload = (data: unknown): AuctionEventPayload => {
  if (data && typeof data === 'object') return data as AuctionEventPayload;
  return { value: data };
};

export const useAuctionSocket = ({
  auctionId,
  token,
  onNewBid,
  onNotificationNew,
  onOutBid,
  onAuctionEnded,
  onAuctionWinnerChanged,
  onPaymentConfirmed,
  onAuctionCancelled,
  onAuctionDeleted,
}: UseAuctionSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);

  const socketUrl = useMemo(() => getSocketUrl(), []);

  useEffect(() => {
    if (!auctionId || !socketUrl) return;

    const socket = io(socketUrl, {
      path: '/socket.io',
      autoConnect: false,
      transports: ['websocket'],
      auth: token ? { token } : undefined,
    });

    socketRef.current = socket;

    const joinAuction = () => {
      socket.emit('joinAuction', { auctionId });
    };

    const handleNewBid = (data: unknown) => onNewBid?.(getPayload(data));
    const handleNotificationNew = (data: unknown) => onNotificationNew?.(getPayload(data));
    const handleOutBid = (data: unknown) => onOutBid?.(getPayload(data));
    const handleAuctionEnded = (data: unknown) => onAuctionEnded?.(getPayload(data));
    const handleAuctionWinnerChanged = (data: unknown) =>
      onAuctionWinnerChanged?.(getPayload(data));
    const handlePaymentConfirmed = (data: unknown) => onPaymentConfirmed?.(getPayload(data));
    const handleAuctionCancelled = (data: unknown) => onAuctionCancelled?.(getPayload(data));
    const handleAuctionDeleted = (data: unknown) => onAuctionDeleted?.(getPayload(data));

    socket.on('connect', joinAuction);
    socket.on('newBid', handleNewBid);
    socket.on('new-bid', handleNewBid);
    socket.on('notification:new', handleNotificationNew);
    socket.on('outBid', handleOutBid);
    socket.on('auctionEnded', handleAuctionEnded);
    socket.on('auctionWinnerChanged', handleAuctionWinnerChanged);
    socket.on('paymentConfirmed', handlePaymentConfirmed);
    socket.on('auctionCancelled', handleAuctionCancelled);
    socket.on('auctionDeleted', handleAuctionDeleted);

    socket.connect();

    return () => {
      socket.off('connect', joinAuction);
      socket.off('newBid', handleNewBid);
      socket.off('new-bid', handleNewBid);
      socket.off('notification:new', handleNotificationNew);
      socket.off('outBid', handleOutBid);
      socket.off('auctionEnded', handleAuctionEnded);
      socket.off('auctionWinnerChanged', handleAuctionWinnerChanged);
      socket.off('paymentConfirmed', handlePaymentConfirmed);
      socket.off('auctionCancelled', handleAuctionCancelled);
      socket.off('auctionDeleted', handleAuctionDeleted);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [auctionId, socketUrl, token, onNewBid, onNotificationNew, onOutBid, onAuctionEnded, onAuctionWinnerChanged, onPaymentConfirmed, onAuctionCancelled, onAuctionDeleted]);

  return socketRef;
};