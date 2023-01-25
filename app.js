client.channels.cache.get("ChannelID")

function playFiles(obj) {
  if (obj.files.length == 0) {
    obj.message.channel.send("end");
    obj.channel.leave(); // <--- Important
    return;
  }
  obj.drive.files.get(
    {
      fileId: obj.files[0].id,
      alt: "media"
    },
    { responseType: "stream" },
    (err, { data }) => {
      if (err) throw new Error(err);
      console.log(obj.files[0]);
      obj.message.channel.send(`Playing ${obj.files[0].name}`);
      obj.connection
        .playStream(data)
        .on("end", () => {
          obj.files.shift();
          playFiles(obj);
        })
        .on("error", err => console.log(err));
    }
  );
}

function main(auth) {
  const token = "MTA2NzY2MTQxNDg5MTc4MjE3Nw.GiVIPJ.NKty3ECRVanVzr2b_UgljjCTGMg-L02xOlNHwg"; // Please set your token for Discord.
  const folderId = "11LNv45UeQbHn9HitR7TKN-01IbeP7Al5"; // Please set the folder ID of Google Drive.

  client.login(token);
  client.on("message", message => {
    console.log("Passed0");
    const channel = message.member.voiceChannel;
    if (channel && message.content == "play") {
      console.log("start");
      message.channel.send("start");
      const drive = google.drive({ version: "v3", auth });
      drive.files.list(
        {
          q: `'${folderId}' in parents`,
          fields: "files(id,name)"
        },
        (err, { data }) => {
          if (err) throw new Error(err);
          channel
            .join()
            .then(connection => {
              let obj = {
                drive: drive,
                channel: channel,
                connection: connection,
                message: message,
                files: data.files
              };
              playFiles(obj);
            })
            .catch(err => console.log(err));
        }
      );
    }
  });
}

const Discord = require("discord.js");
const client = new Discord.Client();