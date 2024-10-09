import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaRegThumbsUp } from "react-icons/fa";
import { PiEggDuotone } from "react-icons/pi";

const InfoItem = ({ label, value }) => (
  <div className="flex text-[#333333] mb-1">
    <div className=" flex items-center">
      <span>
        {label} : {value}
      </span>
    </div>
  </div>
);

const MoviePoster = ({ path, title }) => (
  <img
    className="w-[185px] h-[260px] object-fill mr-8"
    src={`https://image.tmdb.org/t/p/w500${path}`}
    alt={title}
  />
);

const MovieTitle = ({ title, originalTitle }) => (
  <div className="">
    <div className="text-2xl">{title}</div>
    <div className="font-normal text-sm text-[#666666] mb-4">
      {originalTitle}
    </div>
  </div>
);

const BookingButton = ({ onClick }) => (
  <button
    className="h-[35px] font-normal rounded border bg-[#FB4357] text-white py-1 px-6"
    onClick={onClick}
  >
    예매하기
  </button>
);

export default function MovieDetailInfo() {
  const location = useLocation();
  const navigate = useNavigate();
  const movie = location.state?.movie;

  const navigateToTicketPage = () => {
    navigate("/ticket", { state: { selectedMovie: movie } }); // selectedMovie로 키 이름 변경
  };

  if (!movie) {
    return <div>영화 정보를 찾을 수 없습니다.</div>;
  }

  const movieInfo = [
    { label: "장르", value: Array.isArray(movie.genresInKorean) ? movie.genresInKorean.join(", ") : "장르 정보 없음" },
    {
      label: "기본정보",
      value: [
        movie.adult ? "청소년 관람불가" : "전체 관람가",
        movie.original_language,
      ],
    },
    { label: "개봉일", value: movie.release_date },
  ];
  return (
    <div className="pretendard w-[996px] min-w-[980px] mx-auto mt-10 font-bold">
      <div className="flex">
        <MoviePoster path={movie.poster_path} title={movie.title} />

        <div className="w-[760px]">
          <MovieTitle
            title={movie.title}
            originalTitle={movie.original_title}
          />

          <div className="text-[#666666] font-normal flex items-center border-b border-b-[#666666]/[.4] pb-2 mb-4">
            <span className="mr-3 font-bold">평점</span>
            <FaRegThumbsUp size={15} />
            <span className="text-sm ml-0.5">
              {movie.vote_average.toFixed(1)}
            </span>
          </div>

          <div className="text-sm">
            {movieInfo.map((item, index) => (
              <InfoItem key={index} label={item.label} value={item.value} />
            ))}
          </div>

          <div className="flex mt-6">
            <button className="h-[35px] font-normal rounded border border-[#333333] py-1 px-5 flex justify-center items-center mr-2">
              <PiEggDuotone className="mr-1" />
              프리에그
            </button>
            <BookingButton onClick={navigateToTicketPage} />
          </div>
        </div>
      </div>

      <div className="flex items-center mb-14">
        <div className="w-[80%]">
          <p className="text-lg mb-4 pb-4 border-b-2 border-black/[.3]">
            줄거리
          </p>
          <p className="text-black/[.5]">{movie.overview}</p>
        </div>

        <div className="w-[20%] flex justify-end">
          <div className="w-[160px] h-[300px]">
            <img
              src="https://adimg.cgv.co.kr/images/202302/house/CGV_BUGS_160x300.png"
              alt="Left Ad"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
