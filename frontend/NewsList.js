import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Form, Row, Col, Alert, Container } from "react-bootstrap";
import * as XLSX from "xlsx";  // For Excel Export
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./App.css";

const NewsList = () => {
  const navigate = useNavigate();
  const [newsData, setNewsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({ country: "", chemical: "" });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch news data
    axios
      .get("http://localhost:8000/news/")
      .then((response) => setNewsData(response.data))
      .catch((err) => {
        setError("Error fetching news data.");
        console.error(err);
      });

    // Fetch category data
    axios
      .get("http://localhost:8000/news/category")
      .then((response) => setCategories(response.data))
      .catch((err) => {
        setError("Error fetching categories.");
        console.error(err);
      });

    // Fetch subcategory data
    axios
      .get("http://localhost:8000/news/subcategory")
      .then((response) => setSubcategories(response.data))
      .catch((err) => {
        setError("Error fetching subcategories.");
        console.error(err);
      });
  }, []);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleFilterChange = (e) =>
    setFilter({ ...filter, [e.target.name]: e.target.value });

  const handleSort = (column) => {
    setNewsData((prevData) =>
      [...prevData].sort((a, b) => {
        if (column === "date") {
          return new Date(b.publish_date) - new Date(a.publish_date);
        }
        if (column === "title") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      })
    );
  };

  const filteredNews = newsData.filter(
    (news) =>
      (!searchTerm || news.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!filter.country || news.country === filter.country) &&
      (!filter.chemical || news.chemicals.includes(filter.chemical))
  );

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const getCategoryName = (index) => {
    return categories[index] || "No Category";
  };

  const getSubcategoryName = (index) => {
    return subcategories[index] || "No Subcategory";
  };

  const allChemicals = [...new Set(newsData.flatMap((news) => news.chemicals))];
  const allCountries = [...new Set(newsData.map((news) => news.country))];

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredNews);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "News Data");
    XLSX.writeFile(wb, "news_data.xlsx");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
  
    doc.autoTable({
      head: [
        ["Date", "Title", "Category", "Subcategory", "Keywords", "Country", "Chemical"]
      ],
      body: filteredNews.map(news => [
        formatDate(news.publish_date),
        news.title,
        getCategoryName(news.category_id),
        getSubcategoryName(news.subcategory_id),
        news.keywords || "No Keywords",
        news.country || "No Country",
        news.chemicals.join(", ") || "No Chemical"
      ])
    });
  
    doc.save("news-list.pdf");
  };
  

  return (
    <div
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "40px 0",
      }}
    >
      <Container className="bg-light p-4 rounded" style={{ maxWidth: "100%" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-primary">News Management</h2>
          <Button
            className="rounded-pill px-1"
            onClick={() => navigate("/NewsForm")}
          >
            Add News
          </Button>
        </div>

        <Form className="mb-4">
          <Row className="align-items-center">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Search by title"
                value={searchTerm}
                onChange={handleSearch}
              />
            </Col>
            <Col md={4}>
              <Form.Select
                name="country"
                value={filter.country}
                onChange={handleFilterChange}
              >
                <option value="">Filter by Country</option>
                {allCountries.map((country, index) => (
                  <option key={index} value={country}>
                    {country}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                name="chemical"
                value={filter.chemical}
                onChange={handleFilterChange}
              >
                <option value="">Filter by Chemical</option>
                {allChemicals.map((chemical, index) => (
                  <option key={index} value={chemical}>
                    {chemical}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Form>

        {error && <Alert variant="danger">{error}</Alert>}

        <div style={{ overflowX: "auto" }} className="table-container">
  <Table
    striped
    bordered
    hover
    className="fs-5 custom-table"
    style={{
      fontSize: "16px",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
    }}
  >
    <thead>
      <tr>
        <th style={{ minWidth: "120px" }} onClick={() => handleSort("date")}>
          Date
        </th>
        <th style={{ minWidth: "200px" }} onClick={() => handleSort("title")}>
          Title
        </th>
        <th style={{ minWidth: "150px" }}>Category</th>
        <th style={{ minWidth: "150px" }}>Subcategory</th>
        <th style={{ minWidth: "200px" }}>Keywords</th>
        <th style={{ minWidth: "150px" }}>Country</th>
        <th style={{ minWidth: "200px" }}>Chemical</th>
      </tr>
    </thead>
    <tbody>
      {filteredNews.length > 0 ? (
        filteredNews.map((news, index) => (
          <tr key={news.id}>
            <td>{formatDate(news.publish_date)}</td>
            <td>{news.title}</td>
            <td>{getCategoryName(index)}</td>
            <td>{getSubcategoryName(index) || "No Subcategory"}</td>
            <td>{news.keywords || "No Keywords"}</td>
            <td>{news.country || "No Country"}</td>
            <td>{news.chemicals.join(", ") || "No Chemical"}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="7" className="text-center">
            No news found.
          </td>
        </tr>
      )}
    </tbody>
  </Table>
</div>

        <div className="d-flex justify-content-end">
          <Button className="mx-2" onClick={downloadExcel}>
            Download Excel
          </Button>
          <Button onClick={downloadPDF}>Download PDF</Button>
        </div>
      </Container>
    </div>
  );
};

export default NewsList;
