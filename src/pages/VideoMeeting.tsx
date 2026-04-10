import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { VideoMeetingRoom } from "@/components/freelancer/VideoMeetingRoom";

const VideoMeeting = () => {
  const { interviewId } = useParams();

  return (
    <Layout>
      <div className="container py-8">
        <VideoMeetingRoom interviewId={interviewId || ""} />
      </div>
    </Layout>
  );
};

export default VideoMeeting;