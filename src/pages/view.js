import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, database } from '../firebase/firebaseConfig';
import { ref, get } from 'firebase/database';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function View() {
  const [course, setCourse] = useState(null);
  const [files, setFiles] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarActive, setSidebarActive] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { course: courseId } = router.query;
  let pdfDoc = null;

  useEffect(() => {
    if (!courseId) return;

    const checkAccessAndLoadFiles = async () => {
      if (!auth.currentUser) {
        toast.error('Please login to access courses');
        router.push('/login');
        return;
      }

      try {
        // Check if user has purchased the course
        const userRef = ref(database, `users/${auth.currentUser.uid}/purchasedCourses/${courseId}`);
        const userSnapshot = await get(userRef);
        setHasAccess(userSnapshot.exists());

        // Load course details
        const courseRef = ref(database, `courses/${courseId}`);
        const courseSnapshot = await get(courseRef);
        if (courseSnapshot.exists()) {
          setCourse(courseSnapshot.val());
        }

        // Load files
        const filesRef = ref(database, 'files');
        const filesSnapshot = await get(filesRef);
        if (filesSnapshot.exists()) {
          const allFiles = Object.values(filesSnapshot.val()).filter(
            (file) => file.folder === courseId
          );
          setFiles(allFiles);
        }
        setLoading(false);
      } catch (error) {
        toast.error('Error loading course: ' + error.message);
        setLoading(false);
      }
    };

    checkAccessAndLoadFiles();
  }, [courseId]);

  const renderPages = (container) => {
    container.innerHTML = '';
    const visiblePages = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.dataset.page);
            visiblePages.add(pageNum);
            if (!entry.target.children.length) {
              pdfDoc.getPage(pageNum).then((page) => {
                const canvas = document.createElement('canvas');
                canvas.dataset.page = pageNum;
                renderPage(page, canvas, entry.target);
              });
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const pageContainer = document.createElement('div');
      pageContainer.className = 'page-container';
      pageContainer.dataset.page = pageNum;
      container.appendChild(pageContainer);
      observer.observe(pageContainer);
    }
  };

  const renderPage = (page, canvas, container) => {
    const scale = 1.5;
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.className = 'page-canvas';
    container.appendChild(canvas);

    const renderContext = {
      canvasContext: canvas.getContext('2d'),
      viewport: viewport,
    };
    page.render(renderContext).promise.catch((error) => {
      console.error(`Error rendering page:`, error);
    });
  };

  const renderThumbnails = (pdfId) => {
    const thumbnails = document.getElementById('thumbnails');
    thumbnails.innerHTML = '';
    const file = files.find((f) => f.pdfId === pdfId);
    if (!file) return;

    pdfjsLib.getDocument(file.url).promise.then((pdf) => {
      pdfDoc = pdf;
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        pdf.getPage(pageNum).then((page) => {
          const viewport = page.getViewport({ scale: 0.2 });
          const canvas = document.createElement('canvas');
          canvas.className = 'thumbnail';
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          thumbnails.appendChild(canvas);

          const renderContext = {
            canvasContext: canvas.getContext('2d'),
            viewport: viewport,
          };
          page.render(renderContext);

          canvas.addEventListener('click', () => {
            const pageContainer = document.getElementById('pdfViewer').children[pageNum - 1];
            pageContainer.scrollIntoView({ behavior: 'smooth' });
            setSidebarActive(false);
          });
        });
      }
    });
  };

  const updatePageInfo = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = Array.from(document.getElementById('pdfViewer').children).indexOf(entry.target) + 1;
            document.getElementById('pageInfo').textContent = `${pageNum} / ${pdfDoc.numPages}`;
          }
        });
      },
      { threshold: 0.5 }
    );

    Array.from(document.getElementById('pdfViewer').children).forEach((child) => observer.observe(child));
  };

  const searchPDF = (query, pdfId) => {
    if (!query) {
      document.getElementById('status').innerHTML = '';
      return;
    }
    document.getElementById('status').innerHTML = '<div class="text-blue-600">Searching...</div>';
    let found = false;

    const file = files.find((f) => f.pdfId === pdfId);
    if (!file) return;

    pdfjsLib.getDocument(file.url).promise.then((pdf) => {
      pdfDoc = pdf;
      const searchPage = (pageNum) => {
        if (pageNum > pdf.numPages) {
          document.getElementById('status').innerHTML = found
            ? ''
            : '<div class="text-red-500">No matches found</div>';
          return;
        }

        pdf.getPage(pageNum).then((page) => {
          page.getTextContent().then((content) => {
            const text = content.items.map((item) => item.str).join(' ').toLowerCase();
            if (text.includes(query.toLowerCase()) && !found) {
              found = true;
              document.getElementById('pdfViewer').children[pageNum - 1].scrollIntoView({ behavior: 'smooth' });
              document.getElementById('status').innerHTML = `<div class="text-green-500">Match found on page ${pageNum}</div>`;
            }
            searchPage(pageNum + 1);
          });
        });
      };

      searchPage(1);
    });
  };

  const loadPDF = (pdfId) => {
    const file = files.find((f) => f.pdfId === pdfId);
    if (!file) {
      document.getElementById('status').innerHTML = '<div class="text-red-500">PDF not found</div>';
      document.getElementById('loading').style.display = 'none';
      return;
    }

    document.getElementById('downloadButton').href = file.url;
    document.getElementById('downloadButton').classList.remove('hidden');

    pdfjsLib.getDocument(file.url).promise
      .then((pdf) => {
        pdfDoc = pdf;
        document.getElementById('pdfViewer').style.display = 'block';
        document.getElementById('downloadSection').style.display = 'none';
        document.getElementById('pageInfo').style.display = 'block';
        document.getElementById('loading').style.display = 'none';
        renderPages(document.getElementById('pdfViewer'));
        renderThumbnails(pdfId);
        updatePageInfo();
      })
      .catch((error) => {
        console.error('Error loading PDF:', error);
        document.getElementById('status').innerHTML = '<div class="text-red-500">Failed to load PDF</div>';
        document.getElementById('downloadSection').style.display = 'block';
        document.getElementById('downloadLink').href = file.url;
        document.getElementById('pdfViewer').style.display = 'none';
        document.getElementById('pageInfo').style.display = 'none';
        document.getElementById('loading').style.display = 'none';
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You need to purchase the {course?.name} course to access its content.
            </p>
            <Link href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Purchase Now
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const folders = {};
  files.forEach((file) => {
    if (!folders[file.folder]) folders[file.folder] = {};
    if (file.subfolder) {
      if (!folders[file.folder][file.subfolder]) folders[file.folder][file.subfolder] = [];
      folders[file.folder][file.subfolder].push(file);
    } else {
      if (!folders[file.folder]['_files']) folders[file.folder]['_files'] = [];
      folders[file.folder]['_files'].push(file);
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex">
        <div
          id="sidebar"
          className={`fixed md:static h-[calc(100vh-64px)] w-64 bg-gray-50 p-4 overflow-y-auto transition-transform duration-300 ${
            sidebarActive ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <h3 className="text-lg font-semibold mb-4">{course?.name} Content</h3>
          <div id="thumbnails" className="space-y-2"></div>
        </div>
        <div className="flex-grow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{course?.name} Course</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setSidebarActive(!sidebarActive)}
                className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <i className="fas fa-th-list"></i>
              </button>
              <button
                onClick={() => {
                  setSearchActive(!searchActive);
                  if (!searchActive) setTimeout(() => document.getElementById('searchInput').focus(), 0);
                  else setSearchQuery('');
                }}
                className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <i className="fas fa-search"></i>
              </button>
              <input
                id="searchInput"
                type="text"
                placeholder="Search in PDF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  searchActive ? 'w-48 opacity-100' : 'w-0 opacity-0'
                }`}
              />
              <a
                id="downloadButton"
                href="#"
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 hidden"
              >
                <i className="fas fa-download"></i>
              </a>
            </div>
          </div>
          <div id="loading" className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
          <div
            id="pdfViewer"
            className="bg-white rounded-lg shadow-lg p-4 hidden max-h-[calc(100vh-120px)] overflow-y-auto snap-y snap-mandatory"
            style={{ scrollbarWidth: 'none' }}
          ></div>
          <div id="downloadSection" className="bg-white rounded-lg shadow-lg p-6 hidden">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Unable to Load PDF</h2>
            <p className="text-gray-600 mb-4">The PDF could not be loaded. Please download it instead.</p>
            <a
              id="downloadLink"
              href="#"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 inline-flex items-center"
            >
              <i className="fas fa-download mr-2"></i> Download PDF
            </a>
          </div>
          <div id="status" className="text-center mt-4"></div>
          <div id="pageInfo" className="hidden fixed bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full"></div>
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Course Files</h3>
            {Object.keys(folders[courseId] || {}).map((subfolder) => (
              <div key={subfolder} className="mb-4">
                <h4 className="text-lg font-medium flex items-center">
                  <i className="fas fa-folder mr-2 text-yellow-500"></i>
                  {subfolder === '_files' ? 'Files' : subfolder}
                </h4>
                <ul className="ml-6 space-y-2">
                  {(folders[courseId][subfolder] || []).map((file) => (
                    <li
                      key={file.pdfId}
                      className="flex justify-between items-center bg-gray-100 p-2 rounded hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        loadPDF(file.pdfId);
                        searchQuery && searchPDF(searchQuery, file.pdfId);
                      }}
                    >
                      <span className="flex items-center">
                        <i className="fas fa-file-pdf mr-2 text-red-500"></i>
                        {file.name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(file.date).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.min.js"></script>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
}
