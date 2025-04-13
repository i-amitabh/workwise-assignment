"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { protectedClient } from "../../components/apiClient";
import { MajorButton } from "@/components/button";
import { Blocks } from "react-loader-spinner";
import toast, { Toaster } from "react-hot-toast";
import { withAuthProvider } from "@/components/withAuthProvider";

function Home() {
  const [seats, setSeats] = useState([]);
  const [numberOfSeats, setNumberOfSeats] = useState();
  const [currentBookedSeat, setCurrentBookedSeat] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const GET_ALL_SEAT_API_ENDPOINT = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/get-all-seats`;
  const BOOK_SEATS_API_ENDPOINT = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/book-seats`;
  const RESET_ALL_SEATS_API_ENDPOINT = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/reset-all-seats`;

  useEffect(() => {
    const fetchSeatStatus = async () => {
      try {
        const response = await protectedClient(GET_ALL_SEAT_API_ENDPOINT, {
          method: "GET",
        });

        if (response.success) {
          setIsLoading(false);
        }

        if (response.seatStatus) {
          setSeats(Object.values(response.seatStatus));
        }

        if (response.currentBookedSeat) {
          setCurrentBookedSeat(response.currentBookedSeat);
        }

        if (!response.success) {
          if (response.message === "Session expired") {
            router.push("/");
          }
          setErrorMessage(parsedResponse.message);
        }
      } catch (error) {
        console.log("Something went wrong while caliing the api", error);
      }
    };
    fetchSeatStatus();
  }, []);

  const handleChange = (e) => {
    setErrorMessage("");
    const num = parseInt(e.target.value);
    if (Number.isInteger(num)) {
      setNumberOfSeats(num);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();

    if (numberOfSeats > 7) {
      setErrorMessage("Must enter less then 7");
      return;
    }
    try {
      const response = await protectedClient(BOOK_SEATS_API_ENDPOINT, {
        method: "POST",
        body: {
          numberOfSeats,
        },
      });

      if (!response.success) {
        if (response.message === "Session expired") {
          router.push("/");
        }
        setErrorMessage(response.message);
      }

      if (response.success) {
        toast.success("Seat Booked successfully!");
        if (response.seatStatus) {
          setSeats(Object.values(response.seatStatus));
        }

        if (response.currentBookedSeat) {
          setCurrentBookedSeat(response.currentBookedSeat);
        }
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const response = await protectedClient(RESET_ALL_SEATS_API_ENDPOINT, {
        method: "GET",
      });
      setCurrentBookedSeat([]);
      if (response.seatStatus) {
        toast.success("Reset Seat successfully!");
        setSeats(Object.values(response.seatStatus));
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem("authToken");
    router.push("/");
  };

  return (
    <div className="container">
      <div className="login-button">
        <MajorButton onClick={handleLogOut} text="Log Out" />
      </div>
      <div className="half-container-wrapper">
        <div className="half-container">
          {isLoading ? (
            <div className="loader-container">
              <Blocks
                height="80"
                width="80"
                color="#4fa94d"
                ariaLabel="blocks-loading"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                visible={true}
              />
            </div>
          ) : (
            <div className="glass-grid-box">
              {seats &&
                seats.map((seat, index) => (
                  <div
                    key={index}
                    className={seat ? "booked-seats" : "free-seats"}
                  >
                    {index + 1}
                  </div>
                ))}
            </div>
          )}
        </div>
        <div className="second-half-container">
          <div className="inner-half-container">
            <div className="current-booked-flex">
              {currentBookedSeat &&
                currentBookedSeat.map((seats, index) => {
                  return (
                    <div key={index} className="current-booked">
                      {seats}
                    </div>
                  );
                })}
            </div>
            <form className="fill-seat">
              <div className="margin-top">
                <label htmlFor="numberOfSeats" className="input-label">
                  Enter number of Seats to book:
                </label>
                <input
                  id="numberOfSeats"
                  name="numberOfSeats"
                  type="number"
                  autoComplete="name"
                  onChange={handleChange}
                  className="input-container"
                  placeholder="Enter number of Seats to book"
                  required
                  aria-required="true"
                />
              </div>
              {errorMessage && <p className="error-text">{errorMessage}</p>}
              <div className="auth-container">
                <MajorButton onClick={handleBook} text={"Book Seats"} />
                <MajorButton onClick={handleReset} text={"Reset Seats"} />
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: "",
          duration: 5000,
          removeDelay: 1000,
          style: {
            background: "#363636",
            color: "#fff",
          },

          // Default options for specific types
          success: {
            duration: 3000,
            iconTheme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />
    </div>
  );
}

export default withAuthProvider(Home);
