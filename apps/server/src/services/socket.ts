import { Server } from 'socket.io'
import Redis from "ioredis";

const redisUri = "redis://default:AVNS_JGiGGfBCJIuZX4Ox8KH@redis-30fee3aa-mohitchoudhary1054-chat-app.a.aivencloud.com:14053";

// Initialize Redis clients
const redisConfig = {
    host: 'redis-30fee3aa-mohitchoudhary1054-chat-app.a.aivencloud.com',
    port: 14054,
    username: 'default',
    password: 'AVNS_JGiGGfBCJIuZX4Ox8KH'
};


const pub = new Redis(redisUri);
const sub = new Redis(redisUri);

class SocketService{
    private _io:Server;

    constructor(){
        console.log("Init Socket sever....");
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*",
            }
        });
        sub.subscribe("MESSAGES");
    }

    public initListeners(){
        const io = this.io
        console.log(`Initialize socket listeners...`);

        io.on('connect',(socket)=>{
            console.log(`New Socket Connected`,socket.id);

            socket.on('event:message',async({message}:{message:string})=>{
                console.log(`New Message Received: `,message);
                // publish this message to redis
                //await pub.publish('MESSAGES',JSON.stringify({ message }));
                try {
                    // Publish the message to the Redis channel
                    await pub.publish('MESSAGES', JSON.stringify({ message }));
                } catch (error) {
                    console.error("Error publishing message to Redis:", error);
                }
            });
        });
        sub.on('message',async(channel,message)=>{
            // console.log(`New Message Received on channel ${channel}`,message);
            // io.emit('event:message',JSON.parse(message));
            if( channel === "MESSAGES"){
                console.log(`New message from redis: `,message);
                io.emit('message',message);
            }
        });
        
    }

    get io(){
        return this._io;
    }
}

export default SocketService;