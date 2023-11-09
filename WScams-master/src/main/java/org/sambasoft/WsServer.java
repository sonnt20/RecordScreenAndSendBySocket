package org.sambasoft;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import java.nio.ByteBuffer;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@ServerEndpoint(value = "/wsServer")
public class WsServer {
    private static Set<Session> peers = Collections.synchronizedSet(new HashSet<Session>());


    @OnOpen
    public void OnOpen(Session session) {
        session.setMaxBinaryMessageBufferSize(999999999);
        System.out.println(String.format("%s joined the save room.", session.toString()));
    }

    @OnMessage
    public void onMessage(Session ss, byte[] img) {
        ByteBuffer buf = ByteBuffer.wrap(img);
        try {
//            byte[] encoded = Base64.encodeBase64(img);
//            String encodedString = new String(encoded, StandardCharsets.US_ASCII);
//            ss.getBasicRemote().sendText(encodedString);

            ss.getBasicRemote().sendBinary(buf);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    @OnMessage
    public void onMessage(Session ss, String vid) {
        try {
            byte[] byteData = vid.getBytes("UTF-8");//Better to specify encoding
            ByteBuffer buf = ByteBuffer.wrap(byteData);
//            Blob docInBlob = new SerialBlob(byteData);

            ss.getBasicRemote().sendBinary(buf);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    @OnClose
    public void onClose(Session ss) {
        try {
            System.out.println("Session closed: " + ss.getId());
            ss.close();
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

}
