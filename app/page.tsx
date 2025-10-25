import ImageTool from "../components/ImageTool";
import BackgroundRemove from "../components/BackgroundRemove";
import PdfMerge from "../components/PdfMerge";

export default function Page() {
  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4 justify-center">
        <a href="#image" className="btn">Image Convert/Compress</a>
        <a href="#bg" className="btn">Remove Background</a>
        <a href="#pdf" className="btn">Combine PDFs</a>
      </div>

      <section id="image" className="mb-8">
        <ImageTool />
      </section>

      <section id="bg" className="mb-8">
        <BackgroundRemove />
      </section>

      <section id="pdf">
        <PdfMerge />
      </section>
    </div>
  );
}
