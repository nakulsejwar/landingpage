from django.urls import path
from .views import *

urlpatterns = [
    path("register/", RegisterUser.as_view()),
    path("login/", LoginUser.as_view()),
    path("generate/", GenerateLanding.as_view()),
    path("generate-image/", GenerateImage.as_view()),
    path("stock-images/", StockImageSearch.as_view()),
    path("landing-image-upload/", LandingImageUpload.as_view()),
    path("page/<uuid:page_id>/", GetLanding.as_view()),
    path("page/<uuid:page_id>/edit/", EditLanding.as_view()),
    path("page/<uuid:page_id>/update/", UpdateLanding.as_view()),
    path("page/<uuid:page_id>/delete/", DeletePage.as_view()),
    path("page/<uuid:page_id>/section/<str:section>/regenerate/", RegenerateSection.as_view()),
    path("page/<uuid:page_id>/section/delete/", DeleteSection.as_view()),
    path("preview-regenerate/", PreviewRegenerate.as_view()),
    path("my-pages/", UserPages.as_view()),
    # Contact form
    path("page/<uuid:page_id>/form/", ContactFormConfigView.as_view()),
    path("page/<uuid:page_id>/form/submit/", ContactFormSubmitView.as_view()),
    path("page/<uuid:page_id>/form/entries/", ContactFormEntriesView.as_view()),
]
