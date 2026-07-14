import React from "react";
import { useWrappedData } from "../../useWrappedData";
import html2canvas from "html2canvas";
import { WrappedList } from "./WrappedList";
import { WrappedStat } from "./WrappedStat";
import { Button } from "../Button";
import { RecordPlayer } from "../RecordPlayer";

export const Wrapped = ({ accessToken }) => {
  const { isLoading, songs, artists, recentlyPlayed, topGenre, topSongImg } =
    useWrappedData(accessToken);

  const handleImageDownload = async () => {
    const element = document.getElementById("print"),
      canvas = await html2canvas(element, { useCORS: true }),
      data = canvas.toDataURL("image/jpg"),
      link = document.createElement("a");

    link.href = data;
    link.download = "spotify-wrapped.jpg";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="wrappedPage"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ddb2ba",
        height: "100vh",
      }}
    >
      <h1> Monthly Spotify Wrapped </h1>

      {isLoading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            width: "300px",
            height: "500px",
          }}
        >
          <strong> Loading... </strong>
          <RecordPlayer />
        </div>
      ) : (
        <div
          className="wrappedNode"
          id="print"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "center",
            width: "300px",
            height: "500px",
            backgroundColor: "#ed6752",
            padding: "50px",
          }}
        >
          <img width={200} height={200} src={topSongImg} alt="top-song" />
          <div
            className="topStats"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <WrappedList title="Top Artists" list={artists} />
            <WrappedList title="Top Songs" list={songs} />
            <WrappedStat title="Recently Played" stat={recentlyPlayed} />
            <WrappedStat title="Top Genre" stat={topGenre} />
          </div>
        </div>
      )}

      <div style={{ marginTop: "28px" }}>
        <Button onClick={handleImageDownload} text={"Download"} />
      </div>
    </div>
  );
};
