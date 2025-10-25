import ImageTool from '../components/ImageTool';
import BackgroundRemove from '../components/BackgroundRemove';
import PdfMerge from '../components/PdfMerge';

export default function Page() {
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <a href="#image" className="btn">Image Convert/Compress</a>
        <a href="#bg" className="btn">Remove Background</a>
        <a href="#pdf" className="btn">Combine PDFs</a>
      </div>

      <div id="image"><ImageTool /></div>
      <div id="bg"><BackgroundRemove /></div>
      <div id="pdf"><PdfMerge /></div>
    </div>
  );
}
