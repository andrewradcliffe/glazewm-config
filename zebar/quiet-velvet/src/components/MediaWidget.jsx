import React, { useEffect, useState, createRef } from 'react';
import {throttle} from "./utils";

const MediaWidget = ({ mediaProvider, audioProvider }) => {
    const [song, setSong] = useState('fetching...');
    const [showSettings, setShowSettings] = useState(false);
    const widgetRef = createRef();

    const maxSongLength = window.innerWidth > 1600 ? 30 : 10;

    async function updateSong() {
        console.log(mediaProvider)
        const tempSong = mediaProvider?.currentSession?.isPlaying ? mediaProvider.currentSession.artist + " - " + mediaProvider.currentSession.title : "...";
        setSong(tempSong)
    }

    useEffect(() => {
        updateSong();
        console.log(audioProvider)
    }, [mediaProvider]);

    useEffect(() => {
       const handleMouseWheel = throttle(async (evt) => {
        const volume = await getVolume();
        evt.deltaY > 0 ? audioProvider.setVolume(volume - 5) : audioProvider.setVolume(volume + 5);
    }, 1000);

        widgetRef?.current?.removeEventListener('mousewheel', handleMouseWheel);
        widgetRef?.current?.addEventListener('mousewheel', handleMouseWheel);

        return () => {
            widgetRef?.current?.removeEventListener('mousewheel', handleMouseWheel);
        };
    }, [audioProvider]);

    const style = {
        textDecoration: 'none', color: 'var(--font-color)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
    }
    const settingsStyle = {
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px',
        paddingRight: '10px',
    }
    const iconStyle = {
        cursor: 'pointer',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        color: 'var(--font-color)', borderRadius: '50%',
    }

    async function previousSong() {
        mediaProvider.previous();
    }

    async function playPause() {
        mediaProvider.togglePlayPause();
    }

    async function skipSong() {
        mediaProvider.next();
    }

    async function getVolume() {
        return audioProvider.defaultPlaybackDevice.volume;
    }

    return (
        <>
            <i className="nf nf-md-music"></i>
            <button ref={widgetRef} className="clean-button" onMouseEnter={() => setShowSettings(true)}
                    onMouseLeave={() => setShowSettings(false)}
                    style={style}>
                <div className="logo" style={style}>
                    {song.length > maxSongLength ? song.substring(0, maxSongLength) + '...' : song}
                </div>
                {showSettings && !['fetching...', 'Error', ''].includes(song) ?
                    <div style={settingsStyle}>
                        <button className="nf nf-md-skip_previous clean-button" style={iconStyle} onClick={async () => {
                            await previousSong();
                            setTimeout(async () => await updateSong(), 1000);
                        }}></button>
                        <button className="nf nf-md-play_pause clean-button" style={iconStyle} onClick={async () => {
                            await playPause();
                            setTimeout(async () => await updateSong(), 1000);
                        }}></button>
                        <button className="nf nf-md-skip_next clean-button" style={iconStyle} onClick={async () => {
                            await skipSong();
                            setTimeout(async () => await updateSong(), 1000);
                        }}></button>
                    </div>
                    : null}
            </button>
        </>
    );
}

export default MediaWidget;
