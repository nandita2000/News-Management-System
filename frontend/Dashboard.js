import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Navbar, Nav, Button } from "react-bootstrap";
import axios from "axios";
import logo from "./logo.png";
import "./App.css";

const imageFiles = ["nasa.jpg", "sports.jpg", "chemical.jpg"];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [imageToShow, setImageToShow] = useState("");
  const [lightboxDisplay, setLightBoxDisplay] = useState(false);
  const [newsCount, setNewsCount] = useState(0); // State for total news count
  const [usersCount, setUsersCount] = useState(0); // State for total users count
  const navigate = useNavigate();

  const fetchImages = () => {
    const imageUrls = imageFiles.map(
      (file) => process.env.PUBLIC_URL + "/images/" + file
    );
    setImages(imageUrls);
    setLoading(false);
  };

  // const fetchCounts = async () => {
  //   try {
  //     const [newsResponse, usersResponse] = await Promise.all([
  //       axios.get("http://localhost:8000/news/count"), // Update with your news count API endpoint
  //       axios.get("http://localhost:8000/users/count"), // Update with your users count API endpoint
  //     ]);
  //     setNewsCount(newsResponse.data);
  //     setUsersCount(usersResponse.data);
  //   } catch (error) {
  //     console.error("Error fetching counts:", error);
  //   }
  // };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchImages();
      // fetchCounts(); // Fetch the counts
    }
  }, [navigate]);

  const showImage = (image) => {
    setImageToShow(image);
    setLightBoxDisplay(true);
  };

  const hideLightBox = () => {
    setLightBoxDisplay(false);
  };

  const showNext = (e) => {
    e.stopPropagation();
    const currentIndex = images.indexOf(imageToShow);
    if (currentIndex >= images.length - 1) {
      setLightBoxDisplay(false);
    } else {
      setImageToShow(images[currentIndex + 1]);
    }
  };

  const showPrev = (e) => {
    e.stopPropagation();
    const currentIndex = images.indexOf(imageToShow);
    if (currentIndex <= 0) {
      setLightBoxDisplay(false);
    } else {
      setImageToShow(images[currentIndex - 1]);
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar fixed="top" expand="lg">
        <Container fluid>
          <Navbar.Brand href="#home">
            <img
              src={logo}
              alt="Logo"
              className="logo"
              style={{ height: "50px", marginRight: "10px" }}
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#logout" onClick={handleLogout}>
                <Button variant="outline-danger">Logout</Button>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="main-content">
        <div className="sidebar">
          <ul>
            <li>
              <Link to="/dashboard" className="sidebar-link">Dashboard</Link>
            </li>
            <li>
              <Link to="/NewsList" className="sidebar-link">News</Link>
            </li>
          </ul>
        </div>

        <div className="dashboard-content">
          <Container>
            <h2
              className="mt-4"
              style={{
                fontFamily: "Times New Roman",
                fontWeight: "bold",
                fontSize: "40px",
                color: "white",
              }}
            >
              Welcome to the News Portal
            </h2>
            <p
              style={{
                fontFamily: "Times New Roman",
                fontSize: "30px",
                marginTop: "10px",
                color: "white",
              }}
            >
              News you need to know
            </p>
            <Row className="stats-grid">
              <Col md={5}>
                <Card className="stat-card blue">
                  <Card.Body>
                    <h5>Total News</h5>
                    <h3>10</h3>
                    {/* <h3>{newsCount}</h3> */}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={5}>
                <Card className="stat-card green">
                  <Card.Body>
                    <h5>Total Users</h5>
                    <h3>7</h3>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="news-images">
              {loading ? (
                <p>Loading images...</p>
              ) : (
                images.map((image, index) => (
                  <img
                    key={index}
                    className="image-card"
                    src={image}
                    alt={`News ${index}`}
                    onClick={() => showImage(image)}
                  />
                ))
              )}
            </div>

            {lightboxDisplay && (
              <div id="lightbox" onClick={hideLightBox}>
                <button onClick={showPrev}>⭠</button>
                <img id="lightbox-img" src={imageToShow} alt="lightbox" />
                <button onClick={showNext}>⭢</button>
              </div>
            )}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
