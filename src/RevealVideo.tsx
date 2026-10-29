import { useEffect, useRef, useState } from 'react';
import { videoForRound } from './media';
export default function RevealVideo({round}:{round:number}) {
 const video=useRef<HTMLVideoElement>(null);
 const [blocked,setBlocked]=useState(false),[failed,setFailed]=useState(false);
 const [source]=useState(()=>videoForRound(round));
 async function play(){const player=video.current;if(!player)return;player.muted=false;player.volume=1;try{await player.play();setBlocked(false);}catch{setBlocked(true);}}
 useEffect(()=>{void play();const player=video.current;return()=>{player?.pause();};},[source]);
 if(!source)return <p>Add your reveal video to “meme for akinator”, then restart the app.</p>;
 return <div className="reveal-video"><video ref={video} src={source} controls playsInline preload="auto" onError={()=>{setFailed(true);setBlocked(false);}} onPlay={()=>setBlocked(false)} aria-label="askinatot meme reveal video"/>{blocked&&!failed&&<button className="primary-button video-play" onClick={play}>▶ Play with sound</button>}{failed&&<p>This browser couldn’t play the clip. <a href={source} target="_blank" rel="noreferrer">Open the video</a></p>}</div>;
}
